import pool from "../../config/db.js";


// get all products
const getProducts = async () => {

    const result = await pool.query(
        `SELECT id,name,sku,unit, low_stock_threshold,
     is_active FROM products
     `
    )
    return result.rows;

}

// create product
const createProduct = async (name, sku, unit, lowStockThreshold) => {
    const result = await pool.query(
        `INSERT INTO products (name,
           sku,
           unit,
           low_stock_threshold
        ) VALUES ($1, $2, $3, $4)
        RETURNING id, name, sku, unit, low_stock_threshold,
        is_active; 
        `,
        [name, sku, unit, lowStockThreshold]
    );
    return result.rows[0];
}

const getProductById = async (id) => {

    const result = await pool.query(
        `SELECT id, name, sku, unit, low_stock_threshold, is_active
         FROM products
         WHERE id = $1`,
        [id]
    );
    return result.rows[0];

}

const updateProduct = async (name, unit, lowStockThreshold, id) => {
    const result = await pool.query(
        `UPDATE products
SET name = $1,
    unit = $2,
    low_stock_threshold = $3
WHERE id = $4
RETURNING id, name, sku, unit, low_stock_threshold, is_active;`,
        [name, unit, lowStockThreshold, id]
    )
    return result.rows[0];
}

const deactivateProduct = async (id) => {
    const result = await pool.query(
        `UPDATE products
        SET is_active = FALSE
        WHERE id = $1
        RETURNING id, name, sku, unit, 
        low_stock_threshold, 
        is_active`,
        [id]
    )
    return result.rows[0];

}



export {
    getProducts,
    createProduct,
    getProductById,
    updateProduct,
    deactivateProduct,

}