import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { loginEmail, loginGoogle, loginKakao } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handle = async (fn: () => Promise<void>) => {
    setError(''); setLoading(true);
    try { await fn(); navigate('/'); }
    catch { setError('로그인에 실패했습니다. 정보를 확인해주세요.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-root">
      <div className="auth-grain" />
      <div className="auth-glow" />
      <div className="auth-line auth-line-left" />
      <div className="auth-line auth-line-right" />

      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">G <em>Bakery</em></span>
          <div className="auth-logo-line" />
        </div>

        <div className="auth-eyebrow">Welcome Back</div>
        <h1 className="auth-title">로그인</h1>

        <div className="auth-form">
          <div className="auth-field">
            <label className="auth-field-label">이메일</label>
            <input className="auth-input" type="email" placeholder="your@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle(() => loginEmail(email, password))} />
          </div>
          <div className="auth-field">
            <label className="auth-field-label">비밀번호</label>
            <input className="auth-input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle(() => loginEmail(email, password))} />
          </div>

          <div className="auth-error">{error}</div>

          <button className="auth-submit" disabled={loading}
            onClick={() => handle(() => loginEmail(email, password))}>
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div className="auth-divider"><span>또는</span></div>

          <button className="auth-social auth-google"
            onClick={() => handle(loginGoogle)}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.5 5C9.6 39.7 16.3 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.6-2.6 4.7-4.8 6.2l6.2 5.2C40.7 36.2 44 30.5 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
            Google로 로그인
          </button>

          <button className="auth-social auth-kakao" onClick={loginKakao}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#3C1E1E">
              <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.8 5.3 4.6 6.8L5.5 21l4.3-2.8c.7.1 1.5.2 2.2.2 5.5 0 10-3.6 10-8S17.5 3 12 3z"/>
            </svg>
            카카오로 로그인
          </button>
        </div>

        <div className="auth-footer">
          <span className="auth-footer-text">
            아직 계정이 없으신가요?&nbsp;
            <button className="auth-link" onClick={() => navigate('/signup')}>회원가입</button>
          </span>
        </div>
      </div>
    </div>
  );
}
