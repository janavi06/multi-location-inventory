import pool from "../../config/db.js";
import AppError from "../utils/AppError.js";


// get all products
const getProducts = async () => {

    const result = await pool.query(
        `SELECT id,name,sku,unit, low_stock_threshold,price,
     is_active FROM products
     `
    )
    return result.rows;

}

// create product
const createProduct = async (name, sku, unit, lowStockThreshold, price) => {
    const result = await pool.query(
        `INSERT INTO products (name,
           sku,
           unit,
           low_stock_threshold,
           price
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, sku, unit, low_stock_threshold,price,
        is_active; 
        `,
        [name, sku, unit, lowStockThreshold, price]
    );
    return result.rows[0];
}

const getProductById = async (id) => {

    const result = await pool.query(
        `SELECT id, name, sku, unit, low_stock_threshold, price, is_active
         FROM products
         WHERE id = $1`,
        [id]
    );
    const product = result.rows[0];

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    return product;
}

const updateProduct = async (
    name,
    unit,
    lowStockThreshold,
    price,
    id
) => {
    const result = await pool.query(
        `UPDATE products
        SET
            name = $1,
            unit = $2,
            low_stock_threshold = $3,
            price = $4
        WHERE id = $5
        RETURNING
            id,
            name,
            sku,
            unit,
            low_stock_threshold,
            price,
            is_active`,
        [name, unit, lowStockThreshold, price, id]
    );

    return result.rows[0];
};

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