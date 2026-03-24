import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import { navigation } from '../hooks/navigation';
import Menu from './Menu';

export default function Header() {
    const { goLogin, goMypage, goFavorite, goCart } = navigation();
    const user = useAuth();
    const logout = async () => {
        try {
            await signOut(auth);
            alert("로그아웃 완료");
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    };

    const login = () => {
        alert("로그인이 필요한 페이지입니다");
        goLogin();
    }

    const btns = [
        { label: "마이페이지", imageClass:"ico-mypage", imageClass_B:"ico-mypage_w", action: goMypage },
        { label: "관심제품", imageClass:"ico-favorite", imageClass_B:"ico-favorite_w", action: goFavorite },
        { label: "장바구니", imageClass:"ico-cart",imageClass_B:"ico-cart_w", action: goCart },
        { label: "로그아웃", imageClass:"ico-",imageClass_B:"ico-", action: logout },
    ];

    const [hover,setHover] = useState<boolean>(false);

    return (
        <div className='header' onMouseOver={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
                {/* 로고 */}
                <img
                    src="../../public/logo.png"
                    alt="로고"
                    className='logo'
                />                
                <Menu />
                <div className='flex items-center justify-evenly'>
                    {btns.map((item, index) => (
                        <button key={index} name={item.label} className={`${hover? item.imageClass_B :item.imageClass} headerbtn`} onClick={user ? item.action : login}>
                            
                        </button>
                    ))}
                </div>
        </div>
    )
}
