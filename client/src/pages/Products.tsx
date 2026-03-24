import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import CartPopup from '../component/CartPopup';
import '../css/products.css';

export type Product = {
  id: number;
  name: string;
  category: string;
  img: string;
  price: number;
  description: string;
  is_new?: boolean;
  is_best?: boolean;
};

const CATEGORIES = ['전체', '롤&번', '소금빵', '크림번', '빵류'];

const SORT_OPTIONS = [
  { value: 'default',    label: '기본순' },
  { value: 'price_asc',  label: '낮은 가격순' },
  { value: 'price_desc', label: '높은 가격순' },
];

export default function Products() {
  const navigate = useNavigate();
  const user = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || '전체';
  const [sort,      setSort]      = useState('default');
  const [products,  setProducts]  = useState<Product[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [popup,     setPopup]     = useState<{ name: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { sort };
    if (category !== '전체') params.category = category;
    axios.get('/api/products', { params })
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [category, sort]);

  // 로그인된 경우 관심목록 초기 로드
  useEffect(() => {
    if (!user) { setFavorites(new Set()); return; }
    api.get('/favorites')
      .then(res => setFavorites(new Set((res.data as Product[]).map(p => p.id))))
      .catch(() => {});
  }, [user]);

  const changeCategory = (cat: string) => {
    if (cat === '전체') setSearchParams({});
    else setSearchParams({ category: cat });
  };

  const addToCart = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/cart', { product_id: product.id });
      setPopup({ name: product.name });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFav = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    const isFav = favorites.has(id);
    setFavorites(prev => {
      const next = new Set(prev);
      isFav ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      if (isFav) await api.delete(`/favorites/${id}`);
      else        await api.post('/favorites', { product_id: id });
    } catch {
      // 실패 시 롤백
      setFavorites(prev => {
        const next = new Set(prev);
        isFav ? next.add(id) : next.delete(id);
        return next;
      });
    }
  };

  const countByCategory = useMemo(() => {
    const map: Record<string, number> = { '전체': 0 };
    CATEGORIES.slice(1).forEach(c => { map[c] = 0; });
    products.forEach(p => {
      map['전체']++;
      if (map[p.category] !== undefined) map[p.category]++;
    });
    return map;
  }, [products]);

  return (
    <div className="gb-page pl-page">
      {popup && (
        <CartPopup productName={popup.name} onClose={() => setPopup(null)} />
      )}

      <div className="gb-page-banner pl-banner">
        <div className="gb-banner-eyebrow">Our Products</div>
        <h1 className="gb-banner-title">제품 목록</h1>
        <p className="gb-banner-sub">매일 새벽 정성껏 구워낸 빵을 만나보세요</p>
      </div>

      <div className="pl-filter-bar">
        <div className="pl-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`pl-tab ${category === cat ? 'active' : ''}`}
              onClick={() => changeCategory(cat)}
            >
              {cat}
              <span className="pl-tab-count">{countByCategory[cat] ?? 0}</span>
            </button>
          ))}
        </div>
        <select
          className="pl-sort"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="pl-body">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(26,14,6,0.3)',
            fontFamily: 'Noto Sans KR, sans-serif', fontSize: 13 }}>
            불러오는 중...
          </div>
        ) : (
          <div className="pl-grid">
            {products.map(product => (
              <div
                className="pl-card"
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="pl-card-img-wrap">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="pl-card-img"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {product.is_new  && <span className="pl-badge new">New</span>}
                  {product.is_best && !product.is_new && <span className="pl-badge best">Best</span>}
                  <button
                    className={`pl-fav-btn ${favorites.has(product.id) ? 'active' : ''}`}
                    onClick={(e) => toggleFav(e, product.id)}
                    title="관심 제품"
                  >
                    {favorites.has(product.id) ? '♥' : '♡'}
                  </button>
                </div>
                <div className="pl-card-body">
                  <span className="pl-card-cat">{product.category}</span>
                  <div className="pl-card-name">{product.name}</div>
                  <div className="pl-card-desc">{product.description}</div>
                  <div className="pl-card-foot">
                    <span className="pl-card-price">₩ {product.price.toLocaleString()}</span>
                    <button
                      className="pl-cart-btn"
                      onClick={(e) => addToCart(e, product)}
                    >
                      담기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
