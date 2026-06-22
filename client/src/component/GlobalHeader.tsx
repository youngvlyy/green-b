import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import '../css/global.css';

type MenuItem = { name: string; sub: { label: string; path?: string }[] };

const menus: MenuItem[] = [
  { name: '회사소개', sub: [{ label: '경영' }] },
  { name: '제품소개', sub: [
    { label: '전체 제품', path: '/products' },
    { label: '롤 & 번',  path: '/products?category=롤%26번' },
    { label: '소금빵',   path: '/products?category=소금빵' },
    { label: '크림번',   path: '/products?category=크림번' },
    { label: '빵류',     path: '/products?category=빵류' },
  ]},
  { name: '가입안내', sub: [{ label: '가입안내' }, { label: '납품안내' }] },
  { name: '고객센터', sub: [{ label: '공지사항' }, { label: 'F&Q' }] },
];

interface Props {
  user: { uid: string; email: string } | null;
}

export default function GlobalHeader({ user }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const goProtected = (path: string) => {
    if (user) navigate(path);
    else navigate('/login');
  };

  const logout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <header className="gb-header">
      {/* 로고 */}
      <div className="gb-logo-wrap" onClick={() => navigate('/')}>
        {/* <img src="/logo.png" alt="Green B&F" className="gb-logo-img" /> */}
        <span className="gb-logo-text">G <em>Bakery</em></span>
      </div>

      {/* 네비게이션 */}
      <nav className="gb-nav">
        {menus.map((menu, idx) => (
          <div key={idx} className="gb-nav-item">
            <span>{menu.name}</span>
            {menu.sub.length > 0 && (
              <div className="gb-subnav">
                {menu.sub.map((s, i) => (
                  <button key={i} className="gb-subnav-btn"
                    onClick={() => s.path && navigate(s.path)}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* 아이콘 */}
      <div className="gb-icons">
        <button className="gb-icon-btn" onClick={() => goProtected('/mypage')}>MY</button>
        <button className="gb-icon-btn" onClick={() => goProtected('/favorite')}>♡</button>
        <button className="gb-icon-btn" onClick={() => goProtected('/cart')}>BAG</button>
        {user
          ? <button className="gb-icon-btn logout-btn" onClick={logout} title="로그아웃">→</button>
          : <button className="gb-icon-btn login-btn" onClick={() => navigate('/login')}>로그인</button>
        }
      </div>
    </header>
  );
}
