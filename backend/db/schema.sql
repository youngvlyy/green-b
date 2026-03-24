-- Green B&F PostgreSQL Schema

-- 확장: 비밀번호 해시(pgcrypto), UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- 1. 회원 (members)
-- 인증은 Firebase가 담당하므로 firebase_uid로 연결, password_hash 불필요
CREATE TABLE members (
    id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid  TEXT          NOT NULL UNIQUE,  -- Firebase Auth UID
    name          VARCHAR(50)   NOT NULL
                    CONSTRAINT members_name_not_blank
                    CHECK (TRIM(name) <> ''),
    email         VARCHAR(255)  NOT NULL UNIQUE
                    CONSTRAINT members_email_format
                    CHECK (email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'),
    phone         VARCHAR(20),
    company       VARCHAR(100),
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 이메일 / firebase_uid 조회 인덱스
CREATE INDEX idx_members_email        ON members (email);
CREATE INDEX idx_members_firebase_uid ON members (firebase_uid);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_members_updated_at
BEFORE UPDATE ON members
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- 2. 제품 (products) — 주문·재고가 참조하는 마스터
CREATE TABLE products (
    id          SERIAL        PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    category    VARCHAR(50)   NOT NULL,
    img         VARCHAR(255)  NOT NULL DEFAULT '',
    price       NUMERIC(10,0) NOT NULL
                  CONSTRAINT products_price_positive CHECK (price > 0),
    description TEXT          NOT NULL DEFAULT '',
    is_new      BOOLEAN       NOT NULL DEFAULT FALSE,
    is_best     BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products (category);


-- 장바구니
CREATE TABLE cart_items (
    id           SERIAL      PRIMARY KEY,
    firebase_uid TEXT        NOT NULL,
    product_id   INTEGER     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity     INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (firebase_uid, product_id)
);

CREATE INDEX idx_cart_uid ON cart_items (firebase_uid);

CREATE TRIGGER trg_cart_updated_at
BEFORE UPDATE ON cart_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- 관심목록
CREATE TABLE favorites (
    id           SERIAL      PRIMARY KEY,
    firebase_uid TEXT        NOT NULL,
    product_id   INTEGER     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (firebase_uid, product_id)
);

CREATE INDEX idx_favorites_uid ON favorites (firebase_uid);


-- 3. 재고 (inventory)
-- 숫자가 정확해야 하므로 INTEGER, 음수 방지 CHECK
CREATE TABLE inventory (
    product_id    INTEGER       PRIMARY KEY
                    REFERENCES products(id) ON DELETE RESTRICT,
    quantity      INTEGER       NOT NULL DEFAULT 0
                    CONSTRAINT inventory_quantity_non_negative
                    CHECK (quantity >= 0),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_inventory_updated_at
BEFORE UPDATE ON inventory
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 재고 차감 함수: 동시성 안전 (SELECT FOR UPDATE)
CREATE OR REPLACE FUNCTION decrease_inventory(p_product_id INTEGER, p_qty INTEGER)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    UPDATE inventory
       SET quantity = quantity - p_qty
     WHERE product_id = p_product_id
       AND quantity   >= p_qty;   -- 재고 부족이면 0건 업데이트

    IF NOT FOUND THEN
        RAISE EXCEPTION '재고 부족: product_id=%, 요청 수량=%', p_product_id, p_qty;
    END IF;
END;
$$;


-- 4. 주문 (orders)
-- 주문번호 고유, 금액·상태 정확
CREATE TYPE order_status AS ENUM (
    'pending',      -- 주문 접수
    'confirmed',    -- 주문 확인
    'preparing',    -- 준비 중
    'shipped',      -- 배송 중
    'delivered',    -- 배송 완료
    'cancelled',    -- 취소
    'refunded'      -- 환불
);

CREATE TABLE orders (
    id            UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number  VARCHAR(20)     NOT NULL UNIQUE,  -- 예: ORD-20260319-0001
    member_id     UUID            NOT NULL
                    REFERENCES members(id) ON DELETE RESTRICT,
    status        order_status    NOT NULL DEFAULT 'pending',
    -- 금액: NUMERIC으로 원 단위 정확 보장 (FLOAT 사용 금지)
    subtotal      NUMERIC(12,0)   NOT NULL
                    CONSTRAINT orders_subtotal_positive CHECK (subtotal > 0),
    delivery_fee  NUMERIC(12,0)   NOT NULL DEFAULT 3000
                    CONSTRAINT orders_delivery_fee_non_negative CHECK (delivery_fee >= 0),
    total_amount  NUMERIC(12,0)   NOT NULL
                    CONSTRAINT orders_total_correct
                    CHECK (total_amount = subtotal + delivery_fee),
    ordered_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- 주문번호 / 회원 인덱스
CREATE INDEX idx_orders_order_number ON orders (order_number);
CREATE INDEX idx_orders_member_id   ON orders (member_id);

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 주문 상품 (orders의 line items)
CREATE TABLE order_items (
    id          SERIAL          PRIMARY KEY,
    order_id    UUID            NOT NULL
                  REFERENCES orders(id) ON DELETE CASCADE,
    product_id  INTEGER         NOT NULL
                  REFERENCES products(id) ON DELETE RESTRICT,
    quantity    INTEGER         NOT NULL
                  CONSTRAINT order_items_qty_positive CHECK (quantity > 0),
    unit_price  NUMERIC(10,0)   NOT NULL  -- 주문 당시 가격 스냅샷
                  CONSTRAINT order_items_price_positive CHECK (unit_price > 0),
    line_total  NUMERIC(12,0)   NOT NULL
                  CONSTRAINT order_items_line_total_correct
                  CHECK (line_total = unit_price * quantity)
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);


-- 5. 결제 (payments)
-- 1원도 틀리면 안 됨 → NUMERIC 고정, 합계 CHECK 강제
CREATE TYPE payment_method AS ENUM (
    'card',
    'bank_transfer',
    'virtual_account',
    'kakao_pay',
    'naver_pay'
);

CREATE TYPE payment_status AS ENUM (
    'ready',        -- 결제 대기
    'paid',         -- 결제 완료
    'cancelled',    -- 결제 취소
    'failed',       -- 결제 실패
    'refunded'      -- 환불 완료
);

CREATE TABLE payments (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID            NOT NULL UNIQUE   -- 주문당 결제 1건
                      REFERENCES orders(id) ON DELETE RESTRICT,
    method          payment_method  NOT NULL,
    status          payment_status  NOT NULL DEFAULT 'ready',
    -- 결제 금액: NUMERIC(12,0) — 정수 원 단위, 부동소수점 오차 없음
    amount          NUMERIC(12,0)   NOT NULL
                      CONSTRAINT payments_amount_positive CHECK (amount > 0),
    -- PG사 거래 ID (외부 연동용)
    pg_transaction_id VARCHAR(100),
    paid_at         TIMESTAMPTZ,
    cancelled_at    TIMESTAMPTZ,
    refunded_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    -- 결제 금액이 주문 total_amount와 반드시 일치해야 함 (트리거로 보장)
    CONSTRAINT payments_status_paid_requires_time
        CHECK (status <> 'paid' OR paid_at IS NOT NULL)
);

CREATE INDEX idx_payments_order_id ON payments (order_id);

CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 결제 금액 ↔ 주문 금액 일치 검증 트리거
CREATE OR REPLACE FUNCTION check_payment_amount()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_order_total NUMERIC(12,0);
BEGIN
    SELECT total_amount INTO v_order_total
      FROM orders WHERE id = NEW.order_id;

    IF NEW.amount <> v_order_total THEN
        RAISE EXCEPTION
            '결제 금액 불일치: 결제=%, 주문=% (order_id=%)',
            NEW.amount, v_order_total, NEW.order_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_payments_amount_check
BEFORE INSERT OR UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION check_payment_amount();


-- 주문번호 자동 생성 함수
-- 형식: ORD-YYYYMMDD-NNNN (하루 9999건까지)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    RETURN 'ORD-'
        || TO_CHAR(NOW(), 'YYYYMMDD')
        || '-'
        || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
END;
$$;
