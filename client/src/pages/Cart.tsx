import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import '../css/global.css';

type CartItem = {
  id: number;
  product_id: number;
  name: string;
  img: string;
  price: number;
  category: string;
  quantity: number;
};

const DELIVERY = 3000;

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cart')
      .then(res => setItems(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // +/- 버튼: 즉시 API 호출
  const changeQty = async (item: CartItem, delta: number) => {
    const next = Math.max(1, item.quantity + delta);
    setItems(prev => prev.map(i => i.product_id === item.product_id ? { ...i, quantity: next } : i));
    try {
      await api.patch(`/cart/${item.product_id}`, { quantity: next });
    } catch {
      setItems(prev => prev.map(i => i.product_id === item.product_id ? { ...i, quantity: item.quantity } : i));
    }
  };

  // input onChange: items 상태만 변경 (API는 onBlur에서 호출)
  const handleQtyInput = (productId: number, val: string) => {
    const num = parseInt(val, 10);
    setItems(prev => prev.map(i =>
      i.product_id === productId ? { ...i, quantity: isNaN(num) ? 0 : num } : i
    ));
  };

  // onBlur: 유효하지 않은 값 복구 + API 호출
  const handleQtyBlur = async (item: CartItem) => {
    const current = items.find(i => i.product_id === item.product_id);
    const next = (!current || current.quantity < 1) ? 1 : current.quantity;
    setItems(prev => prev.map(i => i.product_id === item.product_id ? { ...i, quantity: next } : i));
    if (next !== item.quantity) {
      try {
        await api.patch(`/cart/${item.product_id}`, { quantity: next });
      } catch {
        setItems(prev => prev.map(i => i.product_id === item.product_id ? { ...i, quantity: item.quantity } : i));
      }
    }
  };

  const removeItem = async (item: CartItem) => {
    setItems(prev => prev.filter(i => i.product_id !== item.product_id));
    try {
      await api.delete(`/cart/${item.product_id}`);
    } catch {
      setItems(prev => [...prev, item]);
    }
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + (items.length > 0 ? DELIVERY : 0);
  const fmt = (n: number) => `₩ ${n.toLocaleString()}`;

  return (
    <div className="gb-page">
      <div className="gb-page-banner">
        <div className="gb-banner-eyebrow">Shopping Cart</div>
        <h1 className="gb-banner-title">장바구니</h1>
        <p className="gb-banner-sub">{items.length}개의 제품이 담겨 있습니다</p>
      </div>

      <div className="gb-page-body">
        {loading ? (
          <div style={{
            textAlign: 'center', padding: '80px 0', color: 'rgba(26,14,6,0.3)',
            fontFamily: 'Noto Sans KR, sans-serif', fontSize: 13
          }}>
            불러오는 중...
          </div>
        ) : items.length === 0 ? (
          <div className="gb-empty">
            <div className="gb-empty-icon">🛒</div>
            <div className="gb-empty-title">장바구니가 비어있습니다</div>
            <div className="gb-empty-sub">맛있는 빵을 담아보세요</div>
            <button className="gb-btn gb-btn-primary" style={{ marginTop: 28 }}
              onClick={() => navigate('/products')}>
              제품 둘러보기
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="gb-card cart-items-card">
              {items.map(item => (
                <div className="cart-item" key={item.product_id}>
                  <div className="cart-item-emoji">
                    <img src={item.img} alt={item.name}
                      style={{ width: 48, height: 48, objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-sub">{fmt(item.price)} / 개</div>
                  </div>
                  <div className="cart-item-right">
                    <div className="cart-item-price">{fmt(item.price * item.quantity)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="cart-qty">
                        <button className="cart-qty-btn" onClick={() => changeQty(item, -1)}>−</button>
                        <input
                          type="number"
                          value={item.quantity === 0 ? '' : item.quantity}
                          className="pd-qty-num"
                          min={1}
                          onChange={e => handleQtyInput(item.product_id, e.target.value)}
                          onBlur={() => handleQtyBlur(item)}
                        />
                        <button className="cart-qty-btn" onClick={() => changeQty(item, +1)}>+</button>
                      </div>
                      <button className="cart-remove-btn" onClick={() => removeItem(item)}>✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="gb-card cart-summary-card">
              <div className="cart-summary-title">주문 요약</div>
              <div className="cart-summary-row">
                <span>상품 합계</span><span>{fmt(subtotal)}</span>
              </div>
              <div className="cart-summary-row">
                <span>배송비</span><span>{fmt(DELIVERY)}</span>
              </div>
              <div className="cart-summary-total">
                <span className="cart-total-label">최종 금액</span>
                <span className="cart-total-price">{fmt(total)}</span>
              </div>
              <button className="cart-checkout-btn">결제하기</button>
              <button className="gb-btn gb-btn-ghost"
                style={{ width: '100%', marginTop: 10, padding: '12px 0' }}
                onClick={() => navigate('/products')}>
                계속 쇼핑하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
