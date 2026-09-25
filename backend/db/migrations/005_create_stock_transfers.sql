CREATE TABLE stock_transfers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    source_inventory_id BIGINT NOT NULL,
    destination_inventory_id BIGINT NOT NULL,

    quantity NUMERIC(10, 2) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT stock_transfers_source_inventory_fk
        FOREIGN KEY (source_inventory_id)
        REFERENCES inventory(id),

    CONSTRAINT stock_transfers_destination_inventory_fk
        FOREIGN KEY (destination_inventory_id)
        REFERENCES inventory(id),

    CONSTRAINT stock_transfers_quantity_check
        CHECK (quantity > 0),

    CONSTRAINT stock_transfers_different_inventory_check
        CHECK (source_inventory_id <> destination_inventory_id)
);