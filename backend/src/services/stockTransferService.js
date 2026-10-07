import pool from "../../config/db";

const createStockTransfer = async (
    sourceInventoryId,
    destinationInventoryId,
    quantity,
    userLocationId,
    userRole

) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `SELECT
        id,
        product_id,
        location_id,
        quantity
     FROM inventory
     WHERE id IN ($1, $2)
     ORDER BY id ASC
     FOR UPDATE;`,
            [sourceInventoryId, destinationInventoryId]
        );

        const rows = result.rows;

        const sourceInventory = rows.find(
            row => Number(row.id) === Number(sourceInventoryId)
        );

        const destinationInventory = rows.find(
            row => Number(row.id) === Number(destinationInventoryId)
        );

        if (sourceInventory == null || destinationInventory == null) {
            throw new AppError("Inventory not found", 404);
        }

        if (
            userRole !== "ADMIN" &&
            Number(sourceInventory.location_id) !== Number(userLocationId)
        ) {
            throw new AppError("Access denied for this location", 403);
        }

        if (sourceInventory.product_id != destinationInventory.product_id) {
            throw new AppError(
                "Source and destination must contain the same product",
                400
            );

        }

        if (quantity <= 0) {
            throw new AppError("Quantity must be greater than zero", 400)
        }

        const currentSourceQuantity = Number(
            sourceInventory.quantity
        );

        const currentDestinationQuantity = Number(
            destinationInventory.quantity
        );

        if (currentSourceQuantity < quantity) {
            throw new AppError("Insufficient stock", 400);
        }


        const newSourceQuantity =
            currentSourceQuantity - quantity;

        const newDestinationQuantity =
            currentDestinationQuantity + quantity;

        await client.query(
            `UPDATE inventory
SET
    quantity = $1,
    updated_at = NOW()
WHERE id = $2;
            `,
            [newSourceQuantity, sourceInventory.id]
        );

        await client.query(
            `UPDATE inventory
SET
    quantity = $1,
    updated_at = NOW()
WHERE id = $2;
            `,
            [newDestinationQuantity, destinationInventory.id]
        )

        const sourceTransactionResult = await client.query(
            `INSERT INTO inventory_transactions (
        inventory_id,
        type,
        quantity,
        previous_quantity,
        new_quantity
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
        id,
        inventory_id,
        type,
        quantity,
        previous_quantity,
        new_quantity,
        reference,
        created_at;`,
            [sourceInventory.id, "TRANSFER_OUT",
                quantity, currentSourceQuantity,
                newSourceQuantity
            ]
        );

        const destinationTransactionResult = await client.query(
            `INSERT INTO inventory_transactions (
        inventory_id,
        type,
        quantity,
        previous_quantity,
        new_quantity
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
        id,
        inventory_id,
        type,
        quantity,
        previous_quantity,
        new_quantity,
        reference,
        created_at;`,
            [destinationInventory.id, "TRANSFER_IN",
                quantity, currentDestinationQuantity,
                newDestinationQuantity
            ]
        );

        const transferResult = await client.query(
            `INSERT INTO stock_transfers (
        source_inventory_id,
        destination_inventory_id,
        quantity,
        status
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
        id,
        source_inventory_id,
        destination_inventory_id,
        quantity,
        status,
        created_at,
        updated_at;`,
            [sourceInventoryId,
                destinationInventoryId,
                quantity,
                "COMPLETED"
            ]
        );
        const transfer = transferResult.rows[0];


        await client.query("COMMIT");

        return {
            transfer,
            sourceInventory: {
                id: sourceInventory.id,
                quantity: newSourceQuantity
            },
            destinationInventory: {
                id: destinationInventory.id,
                quantity: newDestinationQuantity
            }
        }

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }

};

export {
    createStockTransfer
};