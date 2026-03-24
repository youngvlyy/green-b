// hooks/useNav.ts
import { useNavigate } from "react-router-dom";

export function navigation() {
  const navigate = useNavigate();

  return {
    goAdmin: () => navigate("/admin"),
    gomain: () => navigate("/"),
    goHome: () => navigate("/home"),
    goLogin: () => navigate("/login"),
    goSignup: () => navigate("/signup"),
    goMypage: () => navigate("/mypage"),
    goFavorite: () => navigate("/favorite"),
    goCart: () => navigate("/cart"),
  };
}
