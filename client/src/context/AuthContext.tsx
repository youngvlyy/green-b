import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import axios from 'axios';
import { auth } from '../../firebaseConfig';
import { tokenStore } from '../lib/tokenStore';

interface AuthUser { uid: string; email: string }

interface AuthContextValue {
  user:               AuthUser | null;
  loading:            boolean;
  loginEmail:         (email: string, password: string) => Promise<void>;
  loginGoogle:        () => Promise<void>;
  loginKakao:         () => void;
  loginKakaoCallback: (code: string) => Promise<void>;
  signup:             (email: string, password: string, name: string, phone?: string, company?: string) => Promise<void>;
  logout:             () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function exchangeToken(
  idToken: string,
  provider: string,
  extra?: { name?: string; phone?: string; company?: string },
) {
  const { data } = await axios.post('/api/auth/social-login', {
    idToken, provider, ...extra,
  }, { withCredentials: true });

  tokenStore.set(data.accessToken);
  return data as AuthUser & { accessToken: string };
}

async function tryRefresh(): Promise<string | null> {
  try {
    const { data } = await axios.post(
      '/api/auth/refresh', {}, { withCredentials: true },
    );
    tokenStore.set(data.accessToken);
    return data.accessToken;
  } catch {
    tokenStore.set(null);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 페이지 진입 시 리프레시 토큰 쿠키로 액세스 토큰 복구
  useEffect(() => {
    tokenStore.setRefresher(tryRefresh);
    tryRefresh().then(token => {
      if (token) {
        // 토큰 payload에서 uid/email 추출 (base64 decode)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({ uid: payload.uid, email: payload.email });
        } catch {}
      }
      setLoading(false);
    });
  }, []);

  const loginEmail = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();
    const data = await exchangeToken(idToken, 'email');
    setUser({ uid: data.uid, email: data.email });
  };

  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const idToken = await cred.user.getIdToken();
    const data = await exchangeToken(idToken, 'google');
    setUser({ uid: data.uid, email: data.email });
  };

  const loginKakao = () => {
    const key = import.meta.env.VITE_KAKAO_JS_KEY;
    if (!key) { console.error('VITE_KAKAO_JS_KEY 없음'); return; }
    const redirect = `${window.location.origin}/auth/kakao/callback`;
    window.location.href =
      `https://kauth.kakao.com/oauth/authorize?client_id=${key}&redirect_uri=${redirect}&response_type=code`;
  };

  const signup = async (
    email: string, password: string, name: string,
    phone?: string, company?: string,
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();
    const data = await exchangeToken(idToken, 'email', { name, phone, company });
    setUser({ uid: data.uid, email: data.email });
  };

  const loginKakaoCallback = async (code: string) => {
    const redirectUri = `${window.location.origin}/auth/kakao/callback`;
    const { data } = await axios.post(
      '/api/auth/kakao-callback', { code, redirectUri }, { withCredentials: true },
    );
    tokenStore.set(data.accessToken);
    setUser({ uid: data.uid, email: data.email });
  };

  const logout = async () => {
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
    tokenStore.set(null);
    setUser(null);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, loginEmail, loginGoogle, loginKakao, loginKakaoCallback, signup, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
