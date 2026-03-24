import React, { useState } from 'react'

export default function Menu() {
    const menus = [
        { name: "회사소개", sub: ["경영"] },
        { name: "제품소개", sub: ["Best", "케이크", "빵", "마들렌"] },
        { name: "가입안내", sub: ["가입안내", "납품안내"] },
        { name: "고객센터", sub: ["공지사항", "F&Q"] },
    ]

    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    return (
        <div className='menu'>
                {
                    menus.map((menu, index) => (
                        <div key={index} className='menuBtn' onMouseEnter={() => {setHoverIndex(index)} } onMouseLeave={() => setHoverIndex(null)}>
                            <button type='button' >{menu.name}</button>
                            <div
                                className={`submenu
                                    ${(hoverIndex === index && menu.sub.length > 0)
                                    ? "hover"
                                    : null}
                            `}>
                                {
                                    menu.sub.map((s, i) => (
                                        <div key={i} className='h-full flex items-center'>
                                            <button type='button'>{s}</button> 
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    ))
                }
        </div>
    )
}
