import pool from "../../config/db.js"

const createOrder = async (locationId, items) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        if (items == null || items.length === 0){
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

        if (location == null){
            throw new Error("Location not found");
        }

        if (!location.is_active){
            throw new Error("Location is inactive");
        }

        let totalAmount = 0;

        for (const item of items){
            const {productId, quantity} = item;

            if (quantity <= 0){
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

        if (product == null){
            throw new Error("Product not found");
        }

        if (!product.is_active){
            throw new Error("Product is inactive");
        }

        const unitPrice = Number(product.price);
        const subTotal =    quantity * unitPrice;
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

    for (const item of sortedItems){
        const {productId, quantity} = item;

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

if (inventory == null){
    throw new Error(
        "Inventory not found for this product at this location"
    );
}

const currentQuantity = Number(inventory.quantity);

if (currentQuantity < quantity){
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


    } catch (error){
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const getOrderById = async (orderId) => {

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

const getOrders = async () => {
    const result = await pool.query(
        `SELECT 
        id,
        location_id,
        status,
        total_amount,
        created_at,
        update_at
        FROM orders
        ORDER BY created_ar DESC;
        `
    )

    return result.rows;
}

const cancelOrder= async () => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

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

        if (order == null){
            throw new Error("Order not found");
        }

        if (order.status == "CANCELLEd"){
            throw new Error("Order is already cancelled");
        }

        if (order.status == "COMPLETED"){
            throw new Error("Completed order cannot be cancelled");
        }

        const itemResult = await client.query(
            `
            SELECT
            id,
            product_id,
            quantity
            FROM order_items
            WHERE order_id = $1
            ORDER by product_id ASC
            FOR UPDATE;
            `,
            [orderId]
        );

        for (const item of itemResult.rows){
            const inventoryResult = await client.query(
                `SELECT
                id,
                quantity
                FROM inventory
                WHERE product_id = $1
                AND location_id = $2
                FOR UPDATE;
                `,
                [item.product_id, order.location_id]
            );

            const inventory = inventoryResult.rows[0];

            if (inventory == null){
                throw new Error(
                    "Inventory not found for this product at this lcoation"
                );
            }

            const currentQuantity = Number(inventory.quantity);
            const quantity = Number(item.quantity);

            const newQuantity = currentQuantity + quantity;

             await client.query(
        `UPDATE inventory
         SET quantity = $1,
             updated_at = NOW()
         WHERE id = $2;`,
        [newQuantity, inventory.id]
    );

        await client.query(
        `INSERT INTO inventory_transactions (
            inventory_id,
            type,
            quantity,
            previous_quantity,
            new_quantity,
            reference
        )
        VALUES ($1, $2, $3, $4, $5, $6);`,
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

        await client.query(
            `UDPATE orders
            SET status = $1,
            updated_at = NOW()
            WHERE id = $2;
            `,
            ["CANCELLED", order.id]
        );

        await client.query("COMMIT");

        return {
            id: order.id,
            status: "CANCELLED"
        };
    }  catch (error) {
    await client.query("ROLLBACK");
    throw new error;
} finally {
    client.release();
}  
}





export {
    createOrder,
    getOrderById,
    getOrders,
    cancelOrder,
}