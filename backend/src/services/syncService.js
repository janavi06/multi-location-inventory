import pool from "../config/db.js";
import AppError from "../utils/AppError.js";

const syncOperation = async (
    operationId,
    type,
    payload,
    userId,
    locationId,
    role
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // =========================================================
        // 1. CHECK IF OPERATION ALREADY EXISTS
        // =========================================================

        const existingResult = await client.query(
            `
            SELECT
                id,
                operation_id,
                type,
                status,
                user_id,
                location_id,
                payload,
                created_at,
                processed_at
            FROM sync_operations
            WHERE operation_id = $1
            FOR UPDATE;
            `,
            [operationId]
        );

        const existingOperation = existingResult.rows[0];


        // =========================================================
        // 2. HANDLE EXISTING OPERATION
        // =========================================================

        if (existingOperation) {

            // Same operation was already successfully processed
            if (existingOperation.status === "PROCESSED") {

                await client.query("ROLLBACK");

                return existingOperation;
            }


            // Another request is currently processing it
            if (existingOperation.status === "PENDING") {

                await client.query("ROLLBACK");

                throw new AppError(
                    "Sync operation is already being processed",
                    409
                );
            }


            // FAILED
            // We allow the operation to continue and retry.
        }


        // =========================================================
        // 3. CREATE NEW SYNC OPERATION
        // =========================================================

        if (!existingOperation) {

            await client.query(
                `
                INSERT INTO sync_operations (
                    operation_id,
                    type,
                    user_id,
                    location_id,
                    payload
                )
                VALUES ($1, $2, $3, $4, $5);
                `,
                [
                    operationId,
                    type,
                    userId,
                    locationId,
                    payload
                ]
            );
        }


        // =========================================================
        // 4. VALIDATE OPERATION TYPE
        // =========================================================

        if (
            type !== "SALE" &&
            type !== "RETURN" &&
            type !== "TRANSFER"
        ) {

            throw new AppError(
                "Invalid sync operation type",
                400
            );
        }


        // =========================================================
        // 5. PROCESS SALE
        // =========================================================

        if (type === "SALE") {

            const {
                productId,
                quantity
            } = payload;


            if (
                !Number.isInteger(productId) ||
                productId <= 0
            ) {
                throw new AppError(
                    "productId must be a positive integer",
                    400
                );
            }


            if (
                typeof quantity !== "number" ||
                !Number.isFinite(quantity) ||
                quantity <= 0
            ) {
                throw new AppError(
                    "quantity must be greater than 0",
                    400
                );
            }


            // Find and lock inventory
            const inventoryResult = await client.query(
                `
                SELECT
                    id,
                    product_id,
                    location_id,
                    quantity
                FROM inventory
                WHERE product_id = $1
                AND location_id = $2
                FOR UPDATE;
                `,
                [
                    productId,
                    locationId
                ]
            );

            const inventory = inventoryResult.rows[0];


            if (!inventory) {
                throw new AppError(
                    "Inventory not found",
                    404
                );
            }


            const previousQuantity =
                Number(inventory.quantity);


            if (previousQuantity < quantity) {
                throw new AppError(
                    "Insufficient stock",
                    400
                );
            }


            const newQuantity =
                previousQuantity - quantity;


            // Update inventory
            await client.query(
                `
                UPDATE inventory
                SET
                    quantity = $1,
                    updated_at = NOW()
                WHERE id = $2;
                `,
                [
                    newQuantity,
                    inventory.id
                ]
            );


            // Create inventory history
            await client.query(
                `
                INSERT INTO inventory_transactions (
                    inventory_id,
                    type,
                    quantity,
                    previous_quantity,
                    new_quantity,
                    reference
                )
                VALUES ($1, $2, $3, $4, $5, $6);
                `,
                [
                    inventory.id,
                    "SALE",
                    quantity,
                    previousQuantity,
                    newQuantity,
                    `SYNC-${operationId}`
                ]
            );
        }


        // =========================================================
        // 6. PROCESS RETURN
        // =========================================================

        if (type === "RETURN") {

            const {
                productId,
                quantity
            } = payload;


            if (
                !Number.isInteger(productId) ||
                productId <= 0
            ) {
                throw new AppError(
                    "productId must be a positive integer",
                    400
                );
            }


            if (
                typeof quantity !== "number" ||
                !Number.isFinite(quantity) ||
                quantity <= 0
            ) {
                throw new AppError(
                    "quantity must be greater than 0",
                    400
                );
            }


            const inventoryResult = await client.query(
                `
                SELECT
                    id,
                    product_id,
                    location_id,
                    quantity
                FROM inventory
                WHERE product_id = $1
                AND location_id = $2
                FOR UPDATE;
                `,
                [
                    productId,
                    locationId
                ]
            );

            const inventory = inventoryResult.rows[0];


            if (!inventory) {
                throw new AppError(
                    "Inventory not found",
                    404
                );
            }


            const previousQuantity =
                Number(inventory.quantity);


            const newQuantity =
                previousQuantity + quantity;


            // Update inventory
            await client.query(
                `
                UPDATE inventory
                SET
                    quantity = $1,
                    updated_at = NOW()
                WHERE id = $2;
                `,
                [
                    newQuantity,
                    inventory.id
                ]
            );


            // Create inventory history
            await client.query(
                `
                INSERT INTO inventory_transactions (
                    inventory_id,
                    type,
                    quantity,
                    previous_quantity,
                    new_quantity,
                    reference
                )
                VALUES ($1, $2, $3, $4, $5, $6);
                `,
                [
                    inventory.id,
                    "RETURN",
                    quantity,
                    previousQuantity,
                    newQuantity,
                    `SYNC-${operationId}`
                ]
            );
        }


        // =========================================================
        // 7. PROCESS TRANSFER
        // =========================================================

        if (type === "TRANSFER") {

            const {
                sourceInventoryId,
                destinationInventoryId,
                quantity
            } = payload;


            if (
                !Number.isInteger(sourceInventoryId) ||
                sourceInventoryId <= 0
            ) {
                throw new AppError(
                    "sourceInventoryId must be a positive integer",
                    400
                );
            }


            if (
                !Number.isInteger(destinationInventoryId) ||
                destinationInventoryId <= 0
            ) {
                throw new AppError(
                    "destinationInventoryId must be a positive integer",
                    400
                );
            }


            if (
                sourceInventoryId === destinationInventoryId
            ) {
                throw new AppError(
                    "Source and destination inventory cannot be the same",
                    400
                );
            }


            if (
                typeof quantity !== "number" ||
                !Number.isFinite(quantity) ||
                quantity <= 0
            ) {
                throw new AppError(
                    "quantity must be greater than 0",
                    400
                );
            }


            // Lock both inventory rows in deterministic order
            const inventoryResult = await client.query(
                `
                SELECT
                    id,
                    product_id,
                    location_id,
                    quantity
                FROM inventory
                WHERE id IN ($1, $2)
                ORDER BY id ASC
                FOR UPDATE;
                `,
                [
                    sourceInventoryId,
                    destinationInventoryId
                ]
            );


            if (inventoryResult.rows.length !== 2) {
                throw new AppError(
                    "Source or destination inventory not found",
                    404
                );
            }


            const sourceInventory =
                inventoryResult.rows.find(
                    row =>
                        Number(row.id) ===
                        Number(sourceInventoryId)
                );


            const destinationInventory =
                inventoryResult.rows.find(
                    row =>
                        Number(row.id) ===
                        Number(destinationInventoryId)
                );


            if (
                sourceInventory.location_id !==
                Number(locationId)
            ) {

                if (role !== "ADMIN") {
                    throw new AppError(
                        "Access denied for source location",
                        403
                    );
                }
            }


            if (
                Number(sourceInventory.product_id) !==
                Number(destinationInventory.product_id)
            ) {
                throw new AppError(
                    "Source and destination must contain the same product",
                    400
                );
            }


            const sourcePreviousQuantity =
                Number(sourceInventory.quantity);


            if (sourcePreviousQuantity < quantity) {
                throw new AppError(
                    "Insufficient stock at source location",
                    400
                );
            }


            const sourceNewQuantity =
                sourcePreviousQuantity - quantity;


            const destinationPreviousQuantity =
                Number(destinationInventory.quantity);


            const destinationNewQuantity =
                destinationPreviousQuantity + quantity;


            // Update source
            await client.query(
                `
                UPDATE inventory
                SET
                    quantity = $1,
                    updated_at = NOW()
                WHERE id = $2;
                `,
                [
                    sourceNewQuantity,
                    sourceInventory.id
                ]
            );


            // Update destination
            await client.query(
                `
                UPDATE inventory
                SET
                    quantity = $1,
                    updated_at = NOW()
                WHERE id = $2;
                `,
                [
                    destinationNewQuantity,
                    destinationInventory.id
                ]
            );


            // Source transaction
            await client.query(
                `
                INSERT INTO inventory_transactions (
                    inventory_id,
                    type,
                    quantity,
                    previous_quantity,
                    new_quantity,
                    reference
                )
                VALUES ($1, $2, $3, $4, $5, $6);
                `,
                [
                    sourceInventory.id,
                    "TRANSFER_OUT",
                    quantity,
                    sourcePreviousQuantity,
                    sourceNewQuantity,
                    `SYNC-${operationId}`
                ]
            );


            // Destination transaction
            await client.query(
                `
                INSERT INTO inventory_transactions (
                    inventory_id,
                    type,
                    quantity,
                    previous_quantity,
                    new_quantity,
                    reference
                )
                VALUES ($1, $2, $3, $4, $5, $6);
                `,
                [
                    destinationInventory.id,
                    "TRANSFER_IN",
                    quantity,
                    destinationPreviousQuantity,
                    destinationNewQuantity,
                    `SYNC-${operationId}`
                ]
            );
        }


        // =========================================================
        // 8. MARK SYNC OPERATION AS PROCESSED
        // =========================================================

        const processedResult = await client.query(
            `
            UPDATE sync_operations
            SET
                status = 'PROCESSED',
                processed_at = NOW()
            WHERE operation_id = $1
            RETURNING
                id,
                operation_id,
                type,
                status,
                user_id,
                location_id,
                payload,
                created_at,
                processed_at;
            `,
            [operationId]
        );


        // =========================================================
        // 9. COMMIT EVERYTHING
        // =========================================================

        await client.query("COMMIT");


        return processedResult.rows[0];

    } catch (error) {

        await client.query("ROLLBACK");

            // Only expected business errors become FAILED operations
    if (error instanceof AppError && error.statusCode < 500) {

        try {

            await client.query("BEGIN");

            await client.query(
                `
                INSERT INTO sync_operations (
                    operation_id,
                    type,
                    status,
                    user_id,
                    location_id,
                    payload,
                    processed_at
                )
                VALUES (
                    $1,
                    $2,
                    'FAILED',
                    $3,
                    $4,
                    $5,
                    NOW()
                )
                ON CONFLICT (operation_id)
                DO UPDATE SET
                    status = 'FAILED',
                    processed_at = NOW();
                `,
                [
                    operationId,
                    type,
                    userId,
                    locationId,
                    payload
                ]
            );

            await client.query("COMMIT");

        } catch (failedOperationError) {

            await client.query("ROLLBACK");

            throw failedOperationError;
        }
    }


        throw error;

    } finally {

        client.release();

    }
};


export {
    syncOperation
};