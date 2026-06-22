import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function KakaoCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginKakaoCallback } = useAuth();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get('code');
    if (!code) { navigate('/login'); return; }

    loginKakaoCallback(code)
      .then(() => navigate('/'))
      .catch(() => navigate('/login'));
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#493d34', color: '#f7f2ea', fontFamily: 'Noto Sans KR, sans-serif',
      fontSize: 14, letterSpacing: 1,
    }}>
      카카오 로그인 처리 중...
    </div>
  );
}
