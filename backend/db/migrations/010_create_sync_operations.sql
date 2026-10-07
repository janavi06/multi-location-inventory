CREATE TABLE sync_operations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    operation_id VARCHAR(100) UNIQUE NOT NULL,

    type VARCHAR(30) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    user_id BIGINT NOT NULL,

    location_id BIGINT NOT NULL,

    payload JSONB NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    processed_at TIMESTAMPTZ,

    CONSTRAINT sync_operations_status_check
        CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED')),

    CONSTRAINT sync_operations_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT sync_operations_location_fk
        FOREIGN KEY (location_id)
        REFERENCES locations(id)
);