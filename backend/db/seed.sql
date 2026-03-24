-- 제품 초기 데이터
-- 실행: psql -d <DB명> -f seed.sql

INSERT INTO products (name, category, img, price, description, is_new, is_best) VALUES
-- 롤 & 번
('버터롤',            '롤&번', '/product/butter_roll.png',           2800, '부드러운 버터향이 가득한 클래식 버터롤',          FALSE, TRUE),
('시나몬롤',           '롤&번', '/product/cinnamon_roll.png',         4200, '진한 시나몬과 달콤한 글레이즈의 조화',            FALSE, TRUE),
('시나몬롤 피칸',      '롤&번', '/product/cinnamon_roll_pecan.png',   4800, '고소한 피칸이 더해진 프리미엄 시나몬롤',           TRUE,  FALSE),
('모카롤',            '롤&번', '/product/moca_roll.png',             4500, '진한 커피향과 부드러운 크림의 조화',              FALSE, FALSE),
('뉴욕롤',            '롤&번', '/product/newyork_roll.png',          5200, '뉴욕 스타일의 풍성한 크림 롤',                   FALSE, TRUE),
('뉴욕롤 초코',        '롤&번', '/product/newyork_roll_cho.png',      5200, '진한 초콜릿으로 감싼 달콤한 뉴욕롤',             FALSE, FALSE),
('뉴욕롤 스트로베리',  '롤&번', '/product/newyork_roll_str.png',      5500, '상큼한 딸기 크림의 특별한 뉴욕롤',               TRUE,  FALSE),
('뉴욕롤 바닐라',      '롤&번', '/product/newyork_roll_v.png',        5200, '은은한 바닐라 크림이 풍성한 뉴욕롤',             FALSE, FALSE),
('츄러스롤',           '롤&번', '/product/churos_roll.png',           3800, '바삭한 츄러스 식감의 시나몬 롤빵',               FALSE, FALSE),
('시나몬롤 2호',       '롤&번', '/product/cinnamon_roll_2.png',       4200, '오리지널 시나몬롤의 또 다른 매력',               FALSE, FALSE),
('시나몬롤 피칸 2호',  '롤&번', '/product/cinnamon_roll_pecan_2.png', 4800, '피칸 토핑을 듬뿍 올린 프리미엄 버전',            FALSE, FALSE),
-- 소금빵
('소금빵',            '소금빵', '/product/saltBread.png',            2500, '겉은 바삭, 속은 촉촉한 시그니처 소금빵',          FALSE, TRUE),
('소금빵 2호',         '소금빵', '/product/saltBread_2.png',          2500, '정성껏 구운 두 번째 소금빵 레시피',               FALSE, FALSE),
('소금빵 크림',        '소금빵', '/product/saltBread_cream.png',      3200, '고소한 버터 크림이 가득 담긴 소금빵',             TRUE,  FALSE),
-- 크림번
('크림빵',            '크림번', '/product/cream_c.png',              3800, '부드러운 생크림이 가득한 클래식 크림빵',           FALSE, TRUE),
('크림빵 2호',         '크림번', '/product/cream_c_2.png',            3800, '더 풍성하게 채운 프리미엄 크림빵',                FALSE, FALSE),
('모카번 크림',        '크림번', '/product/mocha_bun_cream.png',      4500, '모카 향 크림이 풍성한 커피 러버 번',              TRUE,  FALSE),
('모카번 크림 2호',    '크림번', '/product/mocha_bun_cream_2.png',    4500, '더 진한 모카 크림으로 완성한 번',                FALSE, FALSE),
-- 빵류
('계란빵',            '빵류',  '/product/eggbread.png',              2800, '따뜻하고 고소한 거리표 계란빵',                   FALSE, TRUE),
('계란빵 파',          '빵류',  '/product/eggbread_pa.png',           3000, '파를 더해 풍미가 깊어진 계란빵',                  FALSE, FALSE),
('멜론빵',            '빵류',  '/product/melon.png',                 3200, '바삭한 쿠키 껍질의 클래식 멜론빵',                FALSE, FALSE),
('콘치즈빵',           '빵류',  '/product/corncheese.png',            3500, '달콤한 콘과 고소한 치즈가 가득',                  FALSE, FALSE),
('핫도그',            '빵류',  '/product/hotdog.png',                3000, '쫀득한 반죽에 소시지가 들어간 인기 빵',            FALSE, FALSE),
('상투과자',           '빵류',  '/product/sangtu.png',                2200, '바삭하고 고소한 전통 상투과자',                   FALSE, FALSE),
('청유브',            '빵류',  '/product/chuengyub.png',             3500, '특제 크림이 가득 담긴 시그니처 빵',               TRUE,  FALSE);

-- 재고 초기값 (각 제품 100개)
INSERT INTO inventory (product_id, quantity)
SELECT id, 100 FROM products;
-- INSERT INTO inventory (product_id, quantity) VALUES
-- (1,  50),   -- 버터롤
-- (2,  30),   -- 시나몬롤
-- (3,  20),   -- 시나몬롤 피칸
-- (4,  45),   -- 모카롤
-- (5,  15),   -- 뉴욕롤
-- ;
