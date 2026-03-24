import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { navigation } from '../hooks/navigation';
import axios from 'axios';
import '../css/auth.css';

export default function Signup() {
  const { goLogin } = navigation();

  const [name,            setName]            = useState('');
  const [phone,           setPhone]           = useState('');
  const [company,         setCompany]         = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error,           setError]           = useState('');
  const [loading,         setLoading]         = useState(false);

  const signup = async () => {
    setError('');

    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      // 1. Firebase Auth에 계정 생성
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Firebase ID 토큰 발급
      const token = await credential.user.getIdToken();

      // 3. 백엔드에 회원 정보 저장
      await axios.post(
        '/api/signup',
        { name: name.trim(), phone: phone.trim(), company: company.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      goLogin();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다.');
      } else if (err.code === 'auth/weak-password') {
        setError('비밀번호는 6자 이상이어야 합니다.');
      } else if (err.code === 'auth/invalid-email') {
        setError('이메일 형식이 올바르지 않습니다.');
      } else {
        setError(err.response?.data?.message ?? err.message ?? '회원가입 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-grain" />
      <div className="auth-glow" />
      <div className="auth-line auth-line-left" />
      <div className="auth-line auth-line-right" />

      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">
            <img src="/logo.png" alt="logo" className="auth-logo-img" />
            Green <em>B&F</em>
          </span>
          <div className="auth-logo-line" />
        </div>

        <div className="auth-eyebrow">Join Us</div>
        <h1 className="auth-title">회원가입</h1>

        <div className="auth-form">
          <div className="auth-field">
            <label className="auth-field-label">이름</label>
            <input
              className="auth-input"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-field-label">전화번호</label>
            <div className="auth-field-row">
              <input
                className="auth-input"
                placeholder="010-0000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button type="button" className="auth-verify-btn">인증</button>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-field-label">기업명</label>
            <input
              className="auth-input"
              placeholder="회사명 (선택)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="auth-divider" />

          <div className="auth-field">
            <label className="auth-field-label">이메일</label>
            <input
              className="auth-input"
              // type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-field-label">비밀번호</label>
            <input
              className="auth-input"
              // type="password"
              placeholder="6자 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-field-label">비밀번호 확인</label>
            <input
              className="auth-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="auth-error">{error}</div>

          <button
            className="auth-submit"
            onClick={signup}
            disabled={loading}
          >
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </div>

        <div className="auth-footer">
          <span className="auth-footer-text">
            이미 계정이 있으신가요?&nbsp;
            <button className="auth-link" onClick={goLogin}>로그인</button>
          </span>
        </div>
      </div>
    </div>
  );
}
