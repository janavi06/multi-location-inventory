CREATE TABLE products(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    unit VARCHAR(20) NOT NULL,
    low_stock_threshold NUMERIC(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    upadted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT products_low_stock_threshold_check
       CHECK (low_stock_threshold >= 0)
);