// 액세스 토큰을 메모리에만 보관 (XSS 방어)
// 리프레시 토큰은 백엔드가 httpOnly 쿠키로 관리

let _token: string | null = null;
let _refresher: (() => Promise<string | null>) | null = null;

export const tokenStore = {
  get:         ()  => _token,
  set:         (t: string | null) => { _token = t; },
  setRefresher:(fn: () => Promise<string | null>) => { _refresher = fn; },
  refresh:     ()  => _refresher ? _refresher() : Promise.resolve(null),
};
