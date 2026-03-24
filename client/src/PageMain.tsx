import React from 'react'
import Header from './component/Header'
import { useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Mypage from './pages/Mypage';
import Favorite from "./pages/Favorite";
import Cart from "./pages/Cart";


export default function PageMain() {
    const location = useLocation();
    const path = location.pathname;
    let Page;

    switch (path) {
        case "/":
            Page = <Home />;
            break;
        case "/admin":
            Page = <Mypage />;
            break;
        case "/login":
            Page = <Favorite />;
            break;
        case "/cart":
            Page = <Cart />;
            break;
        default:
            Page = <Cart />;
    }

    return (
        <div>
            {path !== '/' && <Header />}
            <div>{Page}</div>
        </div>
        )
}
