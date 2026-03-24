import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { navigation } from "../hooks/navigation";
import '../css/auth.css';

export default function Login() {
  const { goSignup } = navigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("이메일 또는 비밀번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') login();
  };

  return (
    <div className="auth-root">
      <div className="auth-grain" />
      <div className="auth-glow" />
      <div className="auth-line auth-line-left" />
      <div className="auth-line auth-line-right" />

      <div className="auth-card">
        {/* 브랜드 로고 */}
        <div className="auth-brand">
          <span className="auth-logo">
            <img src="/logo.png" alt="logo" className="auth-logo-img" />
            Green <em>Bakery</em>
          </span>
          <div className="auth-logo-line" />
        </div>

        <div className="auth-eyebrow">Welcome Back</div>
        <h1 className="auth-title">로그인</h1>

        <div className="auth-form">
          <div className="auth-field">
            <label className="auth-field-label">이메일</label>
            <input
              className="auth-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="auth-field">
            <label className="auth-field-label">비밀번호</label>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="auth-error">{error}</div>

          <button
            className="auth-submit"
            onClick={login}
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </div>

        <div className="auth-footer">
          <span className="auth-footer-text">
            아직 계정이 없으신가요?&nbsp;
            <button className="auth-link" onClick={goSignup}>회원가입</button>
          </span>
        </div>
      </div>
    </div>
  );
}
