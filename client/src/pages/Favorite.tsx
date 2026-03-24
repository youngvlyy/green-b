import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { Product } from './Products';
import '../css/global.css';

export default function Favorite() {
  const navigate = useNavigate();
  const [items,   setItems]   = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/favorites')
      .then(res => setItems(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const removeFav = async (productId: number) => {
    setItems(prev => prev.filter(i => i.id !== productId));
    try {
      await api.delete(`/favorites/${productId}`);
    } catch {
      api.get('/favorites').then(res => setItems(res.data));
    }
  };

  const addToCart = async (productId: number) => {
    try {
      await api.post('/cart', { product_id: productId });
      navigate('/cart');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="gb-page">
      <div className="gb-page-banner">
        <div className="gb-banner-eyebrow">My Favorites</div>
        <h1 className="gb-banner-title">관심 제품</h1>
        <p className="gb-banner-sub">{items.length}개의 제품이 저장되어 있습니다</p>
      </div>

      <div className="gb-page-body">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(26,14,6,0.3)',
            fontFamily: 'Noto Sans KR, sans-serif', fontSize: 13 }}>
            불러오는 중...
          </div>
        ) : items.length === 0 ? (
          <div className="gb-empty">
            <div className="gb-empty-icon">🤍</div>
            <div className="gb-empty-title">관심 제품이 없습니다</div>
            <div className="gb-empty-sub">마음에 드는 빵을 저장해보세요</div>
            <button className="gb-btn gb-btn-primary" style={{ marginTop: 28 }}
              onClick={() => navigate('/products')}>
              제품 둘러보기
            </button>
          </div>
        ) : (
          <div className="fav-grid">
            {items.map(item => (
              <div className="gb-card fav-card" key={item.id}
                onClick={() => navigate(`/products/${item.id}`)}>
                <img src={item.img} alt={item.name}
                  style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                {item.is_new  && <div className="fav-badge">New</div>}
                {item.is_best && !item.is_new && <div className="fav-badge">Best</div>}
                <div className="fav-name">{item.name}</div>
                <div className="fav-desc">{item.description}</div>
                <div className="fav-price">₩ {item.price.toLocaleString()}</div>
                <div className="fav-actions">
                  <button className="gb-btn gb-btn-primary" style={{ flex: 1, padding: '11px 0' }}
                    onClick={e => { e.stopPropagation(); addToCart(item.id); }}>
                    담기
                  </button>
                  <button className="gb-btn gb-btn-ghost"
                    onClick={e => { e.stopPropagation(); removeFav(item.id); }}>
                    ♡ 삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
