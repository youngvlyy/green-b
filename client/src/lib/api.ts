import axios from 'axios';
import { tokenStore } from './tokenStore';

const api = axios.create({ baseURL: '/api', withCredentials: true });

// 요청마다 메모리의 액세스 토큰 첨부
api.interceptors.request.use(config => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 수신 시 리프레시 후 1회 재시도
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const newToken = await tokenStore.refresh();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    console.error('[api 오류]', err.config?.url, err.response?.status, err.response?.data);
    return Promise.reject(err);
  },
);

export default api;
