import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import CartPopup from '../component/CartPopup';
import type { Product } from './Products';
import '../css/productDetail.css';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);
  const [popup, setPopup] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/products/${id}`)
      .then(res => {
        const p: Product = res.data;
        setProduct(p);
        return axios.get('/api/products', { params: { category: p.category } });
      })
      .then(res => {
        setRelated((res.data as Product[]).filter(p => p.id !== Number(id)).slice(0, 4));
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  // 로그인된 경우 관심목록 여부 확인
  useEffect(() => {
    if (!user || !id) return;
    api.get('/favorites')
      .then(res => {
        const ids = (res.data as Product[]).map(p => p.id);
        setFav(ids.includes(Number(id)));
      })
      .catch(() => { });
  }, [user, id]);

  const addToCart = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/cart', { product_id: Number(id), quantity: qty });
      setPopup(true);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFav = async () => {
    if (!user) { navigate('/login'); return; }
    const next = !fav;
    setFav(next);
    try {
      if (!next) await api.delete(`/favorites/${id}`);
      else await api.post('/favorites', { product_id: Number(id) });
    } catch {
      setFav(!next);
    }
  };

  if (loading) {
    return (
      <div className="gb-page pd-page" style={{
        textAlign: 'center', padding: '120px 0',
        color: 'rgba(26,14,6,0.3)', fontFamily: 'Noto Sans KR, sans-serif', fontSize: 13
      }}>
        불러오는 중...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="gb-page pd-page" style={{ textAlign: 'center', padding: '120px 0' }}>
        <p style={{ color: 'rgba(26,14,6,0.4)', fontFamily: 'Noto Sans KR, sans-serif', fontSize: 13 }}>
          제품을 찾을 수 없습니다.
        </p>
        <button
          style={{
            marginTop: 24, background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--br-amber)', fontFamily: 'Noto Sans KR, sans-serif', fontSize: 12,
            letterSpacing: 2, textTransform: 'uppercase' as const
          }}
          onClick={() => navigate('/products')}
        >
          ← 제품 목록
        </button>
      </div>
    );
  }

  return (
    <div className="gb-page pd-page">
      {popup && (
        <CartPopup productName={product.name} onClose={() => setPopup(false)} />
      )}

      <button className="pd-back" onClick={() => navigate(-1)}>
        ← 뒤로
      </button>

      <div className="pd-main">
        <div className="pd-img-wrap">
          <img
            src={product.img}
            alt={product.name}
            className="pd-img"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        <div className="pd-info">
          {(product.is_new || product.is_best) && (
            <div className="pd-badges">
              {product.is_new && <span className="pd-badge new">New</span>}
              {product.is_best && <span className="pd-badge best">Best</span>}
            </div>
          )}

          <span className="pd-cat">{product.category}</span>
          <h1 className="pd-name">{product.name}</h1>
          <div className="pd-price">₩ {product.price.toLocaleString()}</div>

          <hr className="pd-divider" />

          <p className="pd-desc">{product.description}</p>

          <span className="pd-qty-label">수량</span>
          <div className="pd-qty">
            <button className="pd-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <input
              type='number'
              value={qty}
              className="pd-qty-num"
              min={1}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setQty('' as any);  // 일단 비워지게 허용
                  return;
                }
                const num = Number(val);
                if (num >= 1) setQty(num);
              }}
              onBlur={(e) => {
                if (!e.target.value || Number(e.target.value) < 1) {
                  setQty(1);  // 포커스 벗어나면 1로 복구
                }
              }}
            />            
            <button className="pd-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
          </div>

          <div className="pd-actions">
            <button className="pd-btn-cart" onClick={addToCart}>장바구니 담기</button>
            <button className={`pd-btn-fav ${fav ? 'active' : ''}`} onClick={toggleFav}>
              {fav ? '♥' : '♡'}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="pd-related">
          <div className="pd-related-title">같은 카테고리 제품</div>
          <div className="pd-related-grid">
            {related.map(p => (
              <div
                key={p.id}
                className="pd-related-card"
                onClick={() => navigate(`/products/${p.id}`)}
              >
                <div className="pd-related-img-wrap">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="pd-related-img"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div className="pd-related-body">
                  <div className="pd-related-name">{p.name}</div>
                  <div className="pd-related-price">₩ {p.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
