import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/home.css';

export default function Home() {
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [enteredSections, setEnteredSections] = useState<Set<number>>(new Set([0]));

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

  const bestItems = [
    { emoji: '🥐', num: 'No. 01', name: '버터 크루아상', desc: '프랑스산 AOP 버터로 72시간 발효한, 결이 살아있는 크루아상', price: '₩ 3,800' },
    { emoji: '🍞', num: 'No. 02', name: '통밀 사워도우', desc: '48시간 천연 발효, 깊고 풍부한 산미의 시그니처 사워도우', price: '₩ 8,500' },
    { emoji: '🧁', num: 'No. 03', name: '시그니처 케이크', desc: '매일 아침 신선하게 완성되는 부드러운 생크림 케이크', price: '₩ 6,200' },
  ];

  const newItems = [
    { emoji: '🍓', name: '딸기 타르트', price: '₩ 7,500' },
    { emoji: '🫐', name: '블루베리 스콘', price: '₩ 4,200' },
    { emoji: '🍋', name: '레몬 파운드', price: '₩ 5,800' },
    { emoji: '🌿', name: '말차 크림번', price: '₩ 4,800' },
  ];

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
            <div className="s1-tag">
              <span className="s1-tag-line" />
              Artisan Bakery Seoul · Since 2014
              <span className="s1-tag-line" />
            </div>
            <h1 className="s1-h1">
              매일 굽는<br /><em>신선한</em>
            </h1>
            <div className="s1-h1-sub">빵의 온기</div>
            <div className="s1-divider" />
            <p className="s1-desc">좋은 재료, 정직한 손맛<br />새벽 네 시의 정성이 담긴 빵</p>
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
            <h2 className="sec-h2 dark">가장 사랑받는<br />빵들</h2>
            <div className="cards-grid">
              {bestItems.map((item, i) => (
                <div className="best-card" key={i}>
                  <span className="card-emoji">{item.emoji}</span>
                  <div className="card-num">{item.num}</div>
                  <div className="card-name">{item.name}</div>
                  <div className="card-desc">{item.desc}</div>
                  <div className="card-price">{item.price}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* S3: 브랜드 스토리 */}
        <section className={`home-sec s3 ${entered(2)}`}>
          <div className="s3-bg-text">Green Bakery</div>
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
        </section>

        {/* S4: 신상품 */}
        <section className={`home-sec s4 ${entered(3)}`}>
          <div className="s4-inner">
            <div className="s4-left">
              <div className="sec-eyebrow">New Arrivals</div>
              <h2 className="sec-h2 dark">이번 주<br />새로 나온 빵</h2>
              <p className="s4-sub">매주 제철 재료를 담아<br />특별한 빵을 선보입니다.</p>
              <button className="btn-primary" onClick={() => navigate('/cart')}>전체 메뉴 보기</button>
            </div>
            <div className="new-grid">
              {newItems.map((item, i) => (
                <div className="new-card" key={i}>
                  <div className="new-emoji">{item.emoji}</div>
                  <div className="new-badge">New</div>
                  <div className="new-name">{item.name}</div>
                  <div className="new-price">{item.price}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
