import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../css/global.css';

const mockOrders = [
  { emoji: '🥐', name: '버터 크루아상 × 2', date: '2026.03.15', price: '₩ 7,600', status: 'done' },
  { emoji: '🍞', name: '통밀 사워도우 × 1', date: '2026.03.12', price: '₩ 8,500', status: 'done' },
  { emoji: '🍓', name: '딸기 타르트 × 1',   date: '2026.03.10', price: '₩ 7,500', status: 'pending' },
];

export default function Mypage() {
  const user = useAuth();
  const navigate = useNavigate();

  return (
    <div className="gb-page">
      <div className="gb-page-banner">
        <div className="gb-banner-eyebrow">My Account</div>
        <h1 className="gb-banner-title">마이페이지</h1>
        <p className="gb-banner-sub">{user?.email}</p>
      </div>

      <div className="gb-page-body">
        <div className="mp-grid">

          {/* 프로필 카드 */}
          <div className="gb-card mp-profile-card">
            <div className="mp-avatar">👤</div>
            <div className="mp-name">회원님</div>
            <div className="mp-email">{user?.email}</div>
            <div className="mp-divider" />
            <div className="mp-info-row">
              <span className="mp-info-label">이메일</span>
              <span className="mp-info-value">{user?.email}</span>
            </div>
            <div className="mp-info-row">
              <span className="mp-info-label">회원등급</span>
              <span className="mp-info-value">일반회원</span>
            </div>
            <div className="mp-info-row">
              <span className="mp-info-label">가입일</span>
              <span className="mp-info-value">2024.01.01</span>
            </div>
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="gb-btn gb-btn-primary" onClick={() => navigate('/favorite')}>
                관심 제품 보기
              </button>
              <button className="gb-btn gb-btn-outline" onClick={() => navigate('/cart')}>
                장바구니 가기
              </button>
            </div>
          </div>

          {/* 주문 내역 */}
          <div className="gb-card mp-orders-card">
            <div className="mp-section-title">최근 주문 내역</div>
            {mockOrders.map((order, i) => (
              <div className="mp-order-item" key={i}>
                <div className="mp-order-emoji">{order.emoji}</div>
                <div className="mp-order-info">
                  <div className="mp-order-name">{order.name}</div>
                  <div className="mp-order-date">{order.date}</div>
                </div>
                <div className="mp-order-price">{order.price}</div>
                <div className={`mp-order-badge ${order.status}`}>
                  {order.status === 'done' ? '배송완료' : '배송중'}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
