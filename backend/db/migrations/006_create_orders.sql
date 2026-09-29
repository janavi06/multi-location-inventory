CREATE TABLE orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    location_id BIGINT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT orders_location_fk
        FOREIGN KEY (location_id)
        REFERENCES locations(id),

    CONSTRAINT orders_total_amount_check
        CHECK (total_amount >= 0)
);