CREATE TABLE inventory (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    product_id BIGINT NOT NULL,
    location_id BIGINT NOT NULL,

    quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT inventory_product_fk
        FOREIGN KEY (product_id)
        REFERENCES products(id),

    CONSTRAINT inventory_location_fk
        FOREIGN KEY (location_id)
        REFERENCES locations(id),

    CONSTRAINT inventory_quantity_check
        CHECK (quantity >= 0),

    CONSTRAINT inventory_product_location_unique
        UNIQUE (product_id, location_id)
)