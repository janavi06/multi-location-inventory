import pool from "../../config/db";

const createStockTransfer = async (
    sourceInventoryId,
    destinationInventoryId,
    quantity

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
     FOR UPDATE;`,
     [sourceInventoryId, destinationInventoryId]
        );

        const rows = result.rows;

        const sourceInventory = rows.find(
            row => row.id === sourceInventoryId
        )

        const destinationInventory = rows.find(
            row => row.id === destinationInventoryId
        )

        if (sourceInventory == null || destinationInventory == null){
            throw new Error("Inventory not found");
        }

        if (sourceInventory.product_id != destinationInventory.product_id){
            throw new Error(`Source and destination 
                must contain the same product
                `);

        }

        if (quantity <= 0){
            throw new Error("Quantity must be greater than zero")
        }

        const currentSourceQuantity = Number(
            sourceInventory.quantity
        );

        const currentDestinationQuantity = Number(
            destinationInventory.quantity
        );

        if (currentSourceQuantity < quantity) {
           throw new Error("Insufficient stock");
        }


        const newSourceQuantity =
         currentSourceQuantity - quantity;

        const newDestinationQuantity = 
        currentDestinationQuantity + quantity;

        await client.query(
            `UPDATE inventory
            SET quantity = $1
            WHERE id = $2;
            `,
            [newSourceQuantity, sourceInventory.id]
        );

        await client.query(
            `UPDATE inventory
            SET quantity = $1
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

    } catch (error){
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }

};

export {
    createStockTransfer
};