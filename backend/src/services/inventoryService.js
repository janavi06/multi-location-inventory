import pool from "../../config/db.js"


const getInventory = async () => {
    const result = await pool.query(
        `
           SELECT
    id,
    product_id,
    location_id,
    quantity,
    created_at,
    updated_at
FROM inventory;
        `,

    )
    return result.rows;
}

const createInventory = async (productId, locationId, quantity) => {
    const result = await pool.query(
        `INSERT INTO inventory(
            product_id,
            location_id,
            quantity
        )
        VALUES($1, $2, $3)
        RETURNING
        id,
        product_id,
        location_id,
        quantity,
        created_at,
        updated_at;`,
        [productId, locationId, quantity]
       
    )
    return result.rows[0];
}

const getInventoryById = async (id) => {
    const result = await pool.query(
        `SELECT
    id,
    product_id,
    location_id,
    quantity,
    created_at,
    updated_at
FROM inventory
WHERE id = $1;`,
[id]
    ) 
    return result.rows[0];
}

const updateInventory = async (quantity, id) => {
    const result = await pool.query(
         `
         UPDATE inventory
SET quantity = $1
WHERE id = $2
RETURNING
    id,
    product_id,
    location_id,
    quantity,
    created_at,
    updated_at;
        `,
        [quantity, id]

    )
    return result.rows[0];
}

export {
    getInventory,
    createInventory,
    getInventoryById,
    updateInventory,
}