import { useNavigate } from 'react-router-dom';

interface Props {
  productName: string;
  onClose: () => void;
}

export default function CartPopup({ productName, onClose }: Props) {
  const navigate = useNavigate();

  const goCart = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <div className="cpop-overlay" onClick={onClose}>
      <div className="cpop-card" onClick={e => e.stopPropagation()}>
        <div className="cpop-icon">🛒</div>
        <div className="cpop-title">장바구니에 담겼습니다</div>
        <div className="cpop-desc">{productName}</div>
        <div className="cpop-actions">
          <button className="cpop-btn-outline" onClick={onClose}>계속 쇼핑</button>
          <button className="cpop-btn-primary" onClick={goCart}>장바구니 보기</button>
        </div>
      </div>
    </div>
  );
}
