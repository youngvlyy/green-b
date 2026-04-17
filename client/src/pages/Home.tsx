import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Product } from './Products';
import AutoSwiper from '../component/AutoSwiper';
import '../css/home.css';

export default function Home() {
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [enteredSections, setEnteredSections] = useState<Set<number>>(new Set([0]));
  const [bestItems, setBestItems] = useState<Product[]>([]);
  const [newItems,  setNewItems]  = useState<Product[]>([]);

  useEffect(() => {
    axios.get('/api/products', { params: { is_best: 'true' } }).then(r => setBestItems(r.data));
    axios.get('/api/products', { params: { is_new:  'true' } }).then(r => setNewItems(r.data));
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const handleScroll = () => {
      const idx = Math.round(wrap.scrollTop / wrap.clientHeight);
      setActiveSection(idx);
      setEnteredSections(prev => prev.has(idx) ? prev : new Set([...prev, idx]));
    };
    wrap.addEventListener('scroll', handleScroll, { passive: true });
    return () => wrap.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (i: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    wrap.scrollTo({ top: i * wrap.clientHeight, behavior: 'smooth' });
  };

  const entered = (i: number) => enteredSections.has(i) ? 'sec-entered' : '';


  return (
    <div className="home-root">

      {/* 도트 네비게이션 */}
      <div className="home-dots">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`home-dot ${activeSection === i ? 'on' : ''}`}
            onClick={() => scrollToSection(i)}
          />
        ))}
      </div>

      {/* 스크롤 스냅 컨테이너 */}
      <div className="home-wrap" ref={wrapRef}>

        {/* S1: 히어로 */}
        <section className={`home-sec s1 ${entered(0)}`}>
          <div className="s1-grain" />
          <div className="s1-glow" />
          <div className="s1-line s1-line-left" />
          <div className="s1-line s1-line-right" />
          <div className="s1-content">
            {/* <div className="s1-tag">
              <span className="s1-tag-line" />
              Artisan Bakery Seoul · Since 2014
              <span className="s1-tag-line" />
            </div> */}
            <h1 className="s1-h1">
              OEM협력사<br /><em>HACCP인증</em>
            </h1>
            <div className="s1-h1-sub">문의, 상담 환영합니다</div>
            <div className="s1-divider" />
            <p className="s1-desc"></p>
            <button className="btn-primary" onClick={() => navigate('/cart')}>지금 주문하기</button>
          </div>
          <div className="s1-scroll">
            <div className="s1-scroll-track">
              <div className="s1-scroll-dot" />
            </div>
            <span>scroll</span>
          </div>
        </section>

        {/* S2: 베스트 상품 */}
        <section className={`home-sec s2 ${entered(1)}`}>
          <div className="s2-deco-num">02</div>
          <div className="s2-inner">
            <div className="sec-eyebrow">Best Sellers</div>
            <h2 className="sec-h2 dark">가장 사랑받는 빵들</h2>
            <AutoSwiper
              items={bestItems}
              perView={3}
              gap="1px"
              interval={4000}
              className="best-swiper"
              renderItem={(item, i) => (
                <div className="best-card" onClick={() => navigate(`/products/${item.id}`)}>
                  <img src={item.img} alt={item.name} className="card-img"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className="card-num">No. {String(i + 1).padStart(2, '0')}</div>
                  <div className="card-name">{item.name}</div>
                  <div className="card-desc">{item.description}</div>
                  <div className="card-price">₩ {item.price.toLocaleString()}</div>
                </div>
              )}
            />
          </div>
        </section>

        {/* S3: 브랜드 스토리 */}
        {/* <section className={`home-sec s3 ${entered(2)}`}>
          <div className="s3-bg-text">Green B&F</div>
          <div className="s3-inner">
            <div className="s3-left">
              <div className="s3-frame">
                🏡
                <div className="s3-badge">
                  <div className="s3-badge-num">10</div>
                  <div className="s3-badge-txt">Years</div>
                </div>
              </div>
            </div>
            <div className="s3-right">
              <div className="sec-eyebrow gold">Our Story</div>
              <h2 className="sec-h2 light">10년의<br />진심</h2>
              <p className="s3-body">
                2014년, 작은 동네 골목에서 시작했습니다.<br />
                화려하진 않아도, 매일 새벽 네 시에 일어나<br />
                정직하게 반죽하고 정성껏 구워냈습니다.<br /><br />
                그 마음 하나로, 10년이 지났습니다.
              </p>
              <button className="btn-outline">브랜드 스토리 보기</button>
            </div>
          </div>
        </section> */}

        {/* S4: 신상품 */}
        <section className={`home-sec s4 ${entered(2)}`}>
          <div className="s4-inner">
            <div className="s4-left">
              <div className="sec-eyebrow">New Arrivals</div>
              <h2 className="sec-h2 dark">이번 주<br />새로 나온 빵</h2>
              <p className="s4-sub">매주 제철 재료를 담아<br />특별한 빵을 선보입니다.</p>
              <button className="btn-primary" onClick={() => navigate('/cart')}>전체 메뉴 보기</button>
            </div>
            <AutoSwiper
              items={newItems}
              perView={2}
              gap="16px"
              interval={3500}
              className="new-swiper"
              renderItem={(item) => (
                <div className="new-card" onClick={() => navigate(`/products/${item.id}`)}>
                  <img src={item.img} alt={item.name} className="new-img"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className="new-badge">New</div>
                  <div className="new-name">{item.name}</div>
                  <div className="new-price">₩ {item.price.toLocaleString()}</div>
                </div>
              )}
            />
          </div>
        </section>

      </div>
    </div>
  );
}
