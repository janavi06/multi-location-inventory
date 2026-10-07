import pool from "../../config/db.js"

const createOrder = async (locationId, items) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        if (items == null || items.length === 0) {
            throw new Error("Order must contain atleast one item")

        }

        const locationResult = await client.query(
            `SELECT 
            id,
            is_active
            FROM locations
            WHERE id = $1
            `,
            [locationId]
        )
        const location = locationResult.rows[0];

        if (location == null) {
            throw new Error("Location not found");
        }

        if (!location.is_active) {
            throw new Error("Location is inactive");
        }

        let totalAmount = 0;

        for (const item of items) {
            const { productId, quantity } = item;

            if (quantity <= 0) {
                throw new Error("Item quantity must be greater than zero");
            }


            const productResult = await client.query(
                `SELECT
            id,
            price,
            is_active
            FROM products
            WHERE id = $1
            `,
                [productId]
            );

            const product = productResult.rows[0];

            if (product == null) {
                throw new Error("Product not found");
            }

            if (!product.is_active) {
                throw new Error("Product is inactive");
            }

            const unitPrice = Number(product.price);
            const subTotal = quantity * unitPrice;
            totalAmount += subTotal;
        }

        const orderResult = await client.query(
            `
        INSERT INTO orders (
        lcoation_id,
        stauts,
        total_amount
        )
        VALUES ($1, $2, $3)
        RETURNING
        id, 
        location_id,
        status,
        total_amount,
        created_at,
        updated_at
        `,
            [locationId, "PENDING", totalAmount]
        );

        const order = orderResult.rows[0];

        const sortedItems = [...items].sort(
            (a, b) => a.productId - b.productId
        );

        for (const item of sortedItems) {
            const { productId, quantity } = item;

            const productResult = await client.query(
                `SELECT
            id,
            price
            FROM products
            WHERE id = $1;
            `,
                [productId]
            );

            const product = productResult.rows[0];

            const unitPrice = Number(product.price);
            const subtotal = quantity * unitPrice;

            await client.query(
                `INSERT INTO order_items (
        order_id,
        product_id,
        quantity,
        unit_price,
        subtotal
    )
    VALUES ($1, $2, $3, $4, $5);`,
                [
                    order.id,
                    productId,
                    quantity,
                    unitPrice,
                    subtotal
                ]
            );

            const inventoryResult = await client.query(
                `SELECT
    id,
    product_id,
    location_id,
    quantity
    FROM inventory
    WHERE product_id = $1
    AND location_id = $2
    FOR UPDATE
    `,
                [productId, locationId]
            );

            const inventory = inventoryResult.rows[0];

            if (inventory == null) {
                throw new Error(
                    "Inventory not found for this product at this location"
                );
            }

            const currentQuantity = Number(inventory.quantity);

            if (currentQuantity < quantity) {
                throw new Error("Insufficient stock");
            }

            const newQuantity = currentQuantity - quantity;

            await client.query(
                `UPDATE inventory
    SET quantity = $1,
    updated_at = NOW()
    WHERE id = $2;`,
                [newQuantity, inventory.id]
            )

            await client.query(
                `INSERT INTO inventory_transactions(
    inventory_id,
    type,
    quantity,
    previous_quantity,
    new_quantity,
    refrence
    ) 
    VALUES ($1, $2, $3, $4, $5, $6);
    `,
                [inventory.id,
                    "SALE",
                    quantity,
                    currentQuantity,
                    newQuantity,
                `ORDER-${order.id}`
                ]
            )
        }

        await client.query(
            `UPDATE orders
     SET status = $1,
         updated_at = NOW()
     WHERE id = $2;`,
            ["CONFIRMED", order.id]
        );
        order.status = "CONFIRMED";

        await client.query("COMMIT");

        return order;


    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const getOrderById = async (orderId, userLocationId, userRole) => {

    const orderResult = await pool.query(
        `SELECT
            id,
            location_id,
            status,
            total_amount,
            created_at,
            updated_at
         FROM orders
         WHERE id = $1;`,
        [orderId]
    );

    const order = orderResult.rows[0];

    if (order == null) {
        throw new Error("Order not found");
    }

    if (
        userRole !== "ADMIN" &&
        Number(order.location_id) !== Number(userLocationId)
    ) {
        throw new AppError("Access denied for this location", 403);
    }

    const itemsResult = await pool.query(
        `SELECT
            id,
            product_id,
            quantity,
            unit_price,
            subtotal,
            created_at
         FROM order_items
         WHERE order_id = $1
         ORDER BY id;`,
        [orderId]
    );

    return {
        ...order,
        items: itemsResult.rows
    };
};

const getOrders = async (userLocationId, userRole) => {

    if (userRole === "ADMIN") {
        const result = await pool.query(
            `SELECT 
        id,
        location_id,
        status,
        total_amount,
        created_at,
        updated_at
        FROM orders
        ORDER BY created_at DESC;
        `
        )

        return result.rows;

    } else {
        const result = await pool.query(
            `
    SELECT
        id,
        location_id,
        status,
        total_amount,
        created_at,
        updated_at
    FROM orders
    WHERE location_id = $1
    ORDER BY created_at DESC;
    `,
            [userLocationId]
        );

        return result.rows;

    }

}

const cancelOrder = async (
    orderId,
    userLocationId,
    userRole
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        // 1. Find and lock the order
        const orderResult = await client.query(
            `
            SELECT
                id,
                location_id,
                status
            FROM orders
            WHERE id = $1
            FOR UPDATE;
            `,
            [orderId]
        );

        const order = orderResult.rows[0];

        if (!order) {
            throw new AppError(
                "Order not found",
                404
            );
        }


        // 2. Check location authorization
        if (
            userRole !== "ADMIN" &&
            Number(order.location_id) !== Number(userLocationId)
        ) {
            throw new AppError(
                "Access denied for this location",
                403
            );
        }


        // 3. Check current order status
        if (order.status === "CANCELLED") {
            throw new AppError(
                "Order is already cancelled",
                400
            );
        }

        if (order.status === "COMPLETED") {
            throw new AppError(
                "Completed order cannot be cancelled",
                400
            );
        }


        // 4. Restore inventory ONLY if order was CONFIRMED
        if (order.status === "CONFIRMED") {

            const itemResult = await client.query(
                `
                SELECT
                    id,
                    product_id,
                    quantity
                FROM order_items
                WHERE order_id = $1
                ORDER BY product_id ASC
                FOR UPDATE;
                `,
                [order.id]
            );


            for (const item of itemResult.rows) {

                // Find and lock inventory
                const inventoryResult = await client.query(
                    `
                    SELECT
                        id,
                        quantity
                    FROM inventory
                    WHERE product_id = $1
                    AND location_id = $2
                    FOR UPDATE;
                    `,
                    [
                        item.product_id,
                        order.location_id
                    ]
                );

                const inventory =
                    inventoryResult.rows[0];

                if (!inventory) {
                    throw new AppError(
                        "Inventory not found for this product at this location",
                        404
                    );
                }


                // Calculate restored quantity
                const currentQuantity =
                    Number(inventory.quantity);

                const quantity =
                    Number(item.quantity);

                const newQuantity =
                    currentQuantity + quantity;


                // Restore inventory
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


                // Record inventory transaction
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
                        currentQuantity,
                        newQuantity,
                        `ORDER-${order.id}-CANCEL`
                    ]
                );
            }
        }


        // 5. Cancel the order
        await client.query(
            `
            UPDATE orders
            SET
                status = $1,
                updated_at = NOW()
            WHERE id = $2;
            `,
            [
                "CANCELLED",
                order.id
            ]
        );


        // 6. Commit transaction
        await client.query("COMMIT");


        return {
            id: order.id,
            status: "CANCELLED"
        };

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();
    }
};

const confirmOrder = async (
    orderId,
    userLocationId,
    userRole
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        // 1. Find and lock the order
        const orderResult = await client.query(
            `
            SELECT
                id,
                location_id,
                status,
                total_amount
            FROM orders
            WHERE id = $1
            FOR UPDATE;
            `,
            [orderId]
        );

        const order = orderResult.rows[0];

        if (!order) {
            throw new AppError("Order not found", 404);
        }


        // 2. Check location authorization
        if (
            userRole !== "ADMIN" &&
            Number(order.location_id) !== Number(userLocationId)
        ) {
            throw new AppError(
                "Access denied for this location",
                403
            );
        }


        // 3. Order must be PENDING
        if (order.status !== "PENDING") {
            throw new AppError(
                "Only pending orders can be confirmed",
                400
            );
        }


        // 4. Get order items
        const itemsResult = await client.query(
            `
            SELECT
                id,
                product_id,
                quantity,
                unit_price,
                subtotal
            FROM order_items
            WHERE order_id = $1
            ORDER BY id;
            `,
            [orderId]
        );

        const items = itemsResult.rows;

        if (items.length === 0) {
            throw new AppError(
                "Order has no items",
                400
            );
        }


        // 5. Find and lock inventory + validate stock
        const itemsWithInventory = [];

        for (const item of items) {

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
                    item.product_id,
                    order.location_id
                ]
            );

            const inventory = inventoryResult.rows[0];

            if (!inventory) {
                throw new AppError(
                    `Inventory not found for product ${item.product_id}`,
                    404
                );
            }

            if (
                Number(inventory.quantity) <
                Number(item.quantity)
            ) {
                throw new AppError(
                    `Insufficient stock for product ${item.product_id}`,
                    400
                );
            }

            itemsWithInventory.push({
                item,
                inventory
            });
        }


        // 6. Deduct inventory
        for (const { item, inventory } of itemsWithInventory) {

            const newQuantity =
                Number(inventory.quantity) -
                Number(item.quantity);

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
        }


        // 7. Record inventory transactions
        for (const { item, inventory } of itemsWithInventory) {

            const previousQuantity =
                Number(inventory.quantity);

            const newQuantity =
                previousQuantity -
                Number(item.quantity);

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
                    item.quantity,
                    previousQuantity,
                    newQuantity,
                    `ORDER-${order.id}`
                ]
            );
        }


        // 8. Confirm order
        const updatedOrderResult = await client.query(
            `
            UPDATE orders
            SET
                status = 'CONFIRMED',
                updated_at = NOW()
            WHERE id = $1
            RETURNING
                id,
                location_id,
                status,
                total_amount,
                created_at,
                updated_at;
            `,
            [order.id]
        );

        const updatedOrder =
            updatedOrderResult.rows[0];


        // 9. Commit
        await client.query("COMMIT");

        return updatedOrder;

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();
    }
};




export {
    createOrder,
    getOrderById,
    getOrders,
    cancelOrder,
    confirmOrder
}