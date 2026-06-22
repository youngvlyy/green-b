import express from 'express';
import { randomUUID } from 'crypto';
import admin from 'firebase-admin';
import axios from 'axios';
import pool from './PostgreSQL';
import {
  signAccess, signRefresh, verifyRefresh,
  hashToken, RefreshPayload,
} from './auth';

const router = express.Router();

const COOKIE_OPTS = {
  httpOnly : true,
  secure   : process.env.NODE_ENV === 'production',
  sameSite : 'strict' as const,
  maxAge   : 7 * 24 * 60 * 60 * 1000,
  path     : '/api/auth',
};

async function upsertMember(
  firebase_uid: string, email: string, name: string,
  phone?: string, company?: string,
) {
  await pool.query(
    `INSERT INTO members (firebase_uid, email, name, phone, company)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (firebase_uid)
     DO UPDATE SET email = EXCLUDED.email, updated_at = NOW()`,
    [firebase_uid, email, name || email.split('@')[0], phone || null, company || null],
  );
}

async function issueTokens(res: express.Response, uid: string, email: string) {
  const jti          = randomUUID();
  const accessToken  = signAccess(uid, email);
  const refreshToken = signRefresh(uid, jti);
  const hash         = hashToken(refreshToken);

  await pool.query(
    `INSERT INTO refresh_tokens (jti, firebase_uid, token_hash, expires_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
    [jti, uid, hash],
  );

  res.cookie('rt', refreshToken, COOKIE_OPTS);
  return { accessToken, uid, email };
}

// Google / 이메일 — Firebase ID Token으로 교환
router.post('/social-login', async (req, res) => {
  const { idToken, provider } = req.body as { idToken: string; provider: string };
  if (!idToken) return res.status(400).json({ message: 'idToken 필요' });

  try {
    let uid: string, email: string, name: string;

    if (provider === 'kakao') {
      // Kakao: 액세스 토큰으로 사용자 정보 조회
      const { data } = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      uid   = `kakao:${data.id}`;
      email = data.kakao_account?.email ?? '';
      name  = data.kakao_account?.profile?.nickname ?? '카카오 사용자';

      // 이메일 없이는 가입 불가
      if (!email) return res.status(400).json({ message: '카카오 계정에 이메일이 필요합니다' });
    } else {
      // Google / 이메일: Firebase ID Token 검증
      const decoded = await admin.auth().verifyIdToken(idToken);
      uid   = decoded.uid;
      email = decoded.email ?? '';
      name  = decoded.name ?? decoded.displayName ?? '';
    }

    await upsertMember(uid, email, name);
    const payload = await issueTokens(res, uid, email);
    return res.json(payload);

  } catch (err) {
    console.error('[social-login]', err);
    return res.status(401).json({ message: '소셜 로그인 실패' });
  }
});

// 액세스 토큰 갱신 — httpOnly 쿠키의 리프레시 토큰 사용
router.post('/refresh', async (req, res) => {
  const rt = req.cookies?.rt;
  if (!rt) return res.status(401).json({ message: '리프레시 토큰 없음' });

  let payload: RefreshPayload;
  try {
    payload = verifyRefresh(rt);
  } catch {
    res.clearCookie('rt', { path: '/api/auth' });
    return res.status(401).json({ message: '만료된 리프레시 토큰' });
  }

  const hash = hashToken(rt);
  const { rows } = await pool.query(
    `SELECT jti FROM refresh_tokens
     WHERE jti = $1 AND token_hash = $2 AND expires_at > NOW()`,
    [payload.jti, hash],
  );
  if (!rows.length) {
    res.clearCookie('rt', { path: '/api/auth' });
    return res.status(401).json({ message: '유효하지 않은 리프레시 토큰' });
  }

  // 리프레시 토큰 교체 (rotation)
  await pool.query('DELETE FROM refresh_tokens WHERE jti = $1', [payload.jti]);

  const { rows: member } = await pool.query(
    'SELECT email FROM members WHERE firebase_uid = $1',
    [payload.uid],
  );
  const email = member[0]?.email ?? '';

  const result = await issueTokens(res, payload.uid, email);
  return res.json({ accessToken: result.accessToken });
});

// 로그아웃
router.post('/logout', async (req, res) => {
  const rt = req.cookies?.rt;
  if (rt) {
    try {
      const payload = verifyRefresh(rt);
      await pool.query('DELETE FROM refresh_tokens WHERE jti = $1', [payload.jti]);
    } catch {}
  }
  res.clearCookie('rt', { path: '/api/auth' });
  return res.json({ success: true });
});

// 카카오 인가 코드 교환 — GET /auth/kakao/callback 에서 code를 받아 처리
router.post('/kakao-callback', async (req, res) => {
  const { code, redirectUri } = req.body as { code: string; redirectUri: string };
  if (!code || !redirectUri) return res.status(400).json({ message: 'code, redirectUri 필요' });

  const restKey = process.env.KAKAO_REST_API_KEY;
  if (!restKey) return res.status(500).json({ message: 'KAKAO_REST_API_KEY 미설정' });

  try {
    // 1. 인가 코드 → 카카오 액세스 토큰
    const tokenRes = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      new URLSearchParams({
        grant_type:   'authorization_code',
        client_id:    restKey,
        redirect_uri: redirectUri,
        code,
        ...(process.env.KAKAO_CLIENT_SECRET
          ? { client_secret: process.env.KAKAO_CLIENT_SECRET }
          : {}),
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );
    const kakaoAccessToken: string = tokenRes.data.access_token;

    // 2. 카카오 사용자 정보 조회
    const userRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${kakaoAccessToken}` },
    });
    const data = userRes.data;
    const uid   = `kakao:${data.id}`;
    const email = data.kakao_account?.email ?? '';
    const name  = data.kakao_account?.profile?.nickname ?? '카카오 사용자';

    if (!email) return res.status(400).json({ message: '카카오 계정에 이메일이 필요합니다' });

    // 3. 회원 upsert + JWT 발급
    await upsertMember(uid, email, name);
    const payload = await issueTokens(res, uid, email);
    return res.json(payload);

  } catch (err) {
    console.error('[kakao-callback]', err);
    return res.status(401).json({ message: '카카오 로그인 실패' });
  }
});

// 만료 토큰 정리 (필요 시 cron에서 호출)
router.delete('/refresh-tokens/expired', async (_req, res) => {
  await pool.query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
  res.json({ success: true });
});

export default router;
