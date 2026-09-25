CREATE TABLE inventory_transactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    inventory_id BIGINT NOT NULL,

    type VARCHAR(20) NOT NULL,

    quantity NUMERIC(10, 2) NOT NULL,

    previous_quantity NUMERIC(10, 2) NOT NULL,

    new_quantity NUMERIC(10, 2) NOT NULL,

    reference VARCHAR(100),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT inventory_transactions_inventory_fk
        FOREIGN KEY (inventory_id)
        REFERENCES inventory(id),

    CONSTRAINT inventory_transactions_quantity_check
        CHECK (quantity > 0),

    CONSTRAINT inventory_transactions_new_quantity_check
        CHECK (new_quantity >= 0)
);