import express, { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import pool from './PostgreSQL';

const router = express.Router();

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: '인증 필요' });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    (req as any).uid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰' });
  }
}

// 회원가입 — Firebase 가입 완료 후 호출
// Authorization: Bearer <Firebase ID Token>
router.post('/signup', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: '인증 토큰 없음' });
  }

  let decoded: admin.auth.DecodedIdToken;
  try {
    decoded = await admin.auth().verifyIdToken(token);
  } catch {
    return res.status(401).json({ message: '유효하지 않은 토큰' });
  }

  const { name, phone, company } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: '이름은 필수입니다' });
  }

  try {
    await pool.query(
      `INSERT INTO members (firebase_uid, email, name, phone, company)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        decoded.uid,
        decoded.email,
        name.trim(),
        phone?.trim()   || null,
        company?.trim() || null,
      ]
    );

    return res.status(201).json({ success: true });

  } catch (err: any) {
    // PostgreSQL 유니크 제약 위반 (중복 이메일 / 중복 uid)
    if (err.code === '23505') {
      return res.status(409).json({ message: '이미 가입된 계정입니다' });
    }
    console.error('[signup]', err);
    return res.status(500).json({ message: '서버 오류' });
  }
});

// 회원 정보 조회
router.get('/user/:uid', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM members WHERE firebase_uid = $1',
      [req.params.uid]
    );
    if (rows.length === 0) return res.status(404).json({ message: '회원 없음' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[get user]', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 회원 정보 수정
router.patch('/user/:uid', async (req, res) => {
  const { name, phone, company } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE members
       SET name    = COALESCE($2, name),
           phone   = COALESCE($3, phone),
           company = COALESCE($4, company)
       WHERE firebase_uid = $1
       RETURNING *`,
      [req.params.uid, name ?? null, phone ?? null, company ?? null]
    );
    if (rows.length === 0) return res.status(404).json({ message: '회원 없음' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[patch user]', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 회원 탈퇴
router.delete('/user/:uid', async (req, res) => {
  try {
    await pool.query('DELETE FROM members WHERE firebase_uid = $1', [req.params.uid]);
    res.json({ success: true });
  } catch (err) {
    console.error('[delete user]', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 장바구니 조회
router.get('/cart', requireAuth, async (req, res) => {
  const uid = (req as any).uid;
  try {
    const { rows } = await pool.query(
      `SELECT ci.id, ci.quantity, p.id AS product_id,
              p.name, p.img, p.price::int, p.category
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.firebase_uid = $1
       ORDER BY ci.created_at DESC`,
      [uid]
    );
    res.json(rows);
  } catch (err) {
    console.error('[get cart]', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 장바구니 담기
router.post('/cart', requireAuth, async (req, res) => {
  const uid = (req as any).uid;
  const { product_id } = req.body;
  const {quantity} = req.body.quantity ?? 1; 

  try {
    if (!product_id) return res.status(400).json({ message: 'product_id 필요' });
    await pool.query(
      `INSERT INTO cart_items (firebase_uid, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (firebase_uid, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()`,
      [uid, product_id, quantity]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('[post cart]', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 장바구니 수량 변경
router.patch('/cart/:product_id', requireAuth, async (req, res) => {
  const uid = (req as any).uid;
  const { quantity } = req.body;
  if (!quantity || quantity < 1) return res.status(400).json({ message: '수량 오류' });
  try {
    await pool.query(
      `UPDATE cart_items SET quantity = $3, updated_at = NOW()
       WHERE firebase_uid = $1 AND product_id = $2`,
      [uid, req.params.product_id, quantity]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[patch cart]', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 장바구니 항목 삭제
router.delete('/cart/:product_id', requireAuth, async (req, res) => {
  const uid = (req as any).uid;
  try {
    await pool.query(
      'DELETE FROM cart_items WHERE firebase_uid = $1 AND product_id = $2',
      [uid, req.params.product_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[delete cart]', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 관심목록 조회
router.get('/favorites', requireAuth, async (req, res) => {
  const uid = (req as any).uid;
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.img, p.price::int, p.category,
              p.description, p.is_new, p.is_best
       FROM favorites f
       JOIN products p ON p.id = f.product_id
       WHERE f.firebase_uid = $1
       ORDER BY f.created_at DESC`,
      [uid]
    );
    res.json(rows);
  } catch (err) {
    console.error('[get favorites]', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 관심목록 추가
router.post('/favorites', requireAuth, async (req, res) => {
  const uid = (req as any).uid;
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ message: 'product_id 필요' });
  try {
    await pool.query(
      `INSERT INTO favorites (firebase_uid, product_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [uid, product_id]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('[post favorites]', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 관심목록 삭제
router.delete('/favorites/:product_id', requireAuth, async (req, res) => {
  const uid = (req as any).uid;
  try {
    await pool.query(
      'DELETE FROM favorites WHERE firebase_uid = $1 AND product_id = $2',
      [uid, req.params.product_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[delete favorites]', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 제품 목록 조회 — GET /api/products?category=롤%26번&sort=price_asc
router.get('/products', async (req, res) => {
  const { category, sort, is_new, is_best } = req.query as {
    category?: string; sort?: string; is_new?: string; is_best?: string;
  };

  const conditions: string[] = [];
  const params: (string | boolean)[] = [];

  if (category && category !== '전체') {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }
  if (is_new === 'true') {
    params.push(true);
    conditions.push(`is_new = $${params.length}`);
  }
  if (is_best === 'true') {
    params.push(true);
    conditions.push(`is_best = $${params.length}`);
  }

  let query = `
    SELECT id, name, category, img, price::int AS price,
           description, is_new, is_best
    FROM products
  `;
  if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;

  if (sort === 'price_asc')  query += ' ORDER BY price ASC';
  else if (sort === 'price_desc') query += ' ORDER BY price DESC';
  else query += ' ORDER BY id ASC';

  try {
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('[get products]', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 제품 단건 조회 — GET /api/products/:id
router.get('/products/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, category, img, price::int AS price,
              description, is_new, is_best
       FROM products WHERE id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: '제품 없음' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[get product]', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

export default router;
