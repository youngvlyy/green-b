import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Mypage from './pages/Mypage';
import Favorite from './pages/Favorite';
import Cart from './pages/Cart';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import GlobalHeader from './component/GlobalHeader';
import { useAuth } from './hooks/useAuth';

const NO_HEADER = ['/login', '/signup'];

function AppContent() {
  const user = useAuth();
  const location = useLocation();
  const showHeader = !NO_HEADER.includes(location.pathname);

  return (
    <>
      {showHeader && <GlobalHeader user={user} />}
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/login"   element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup"  element={user ? <Navigate to="/" /> : <Signup />} />
        <Route path="/mypage"  element={user ? <Mypage />   : <Navigate to="/login" />} />
        <Route path="/favorite" element={user ? <Favorite /> : <Navigate to="/login" />} />
        <Route path="/cart"     element={user ? <Cart />     : <Navigate to="/login" />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="*"         element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
