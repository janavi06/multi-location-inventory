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

const createInventoryTransaction = async (
    inventoryId,
    type,
    quantity,
    reference
) => {

    const client = await pool.connect();
     
  try{

        // belong to one transaction. not finalize yet
    await client.query("BEGIN");

    // read inventory i.e current stock
    const result = await client.query(

        ` SELECT
        id,
        quantity
     FROM inventory
     WHERE id = $1
     FOR UPDATE;`,
     [inventoryId]
        
    );
    const inventory = result.rows[0];

    const currentQuantity = Number(inventory.quantity);

    let delta;

    //purchase, return, sale, damage
    if (type === "PURCHASE"){
        delta = quantity;
    } else if (type === "RETURN"){
        delta = quantity;
    } else if (type === "SALE"){
        delta = -quantity;
    } else if (type === "DAMAGE"){
        delta = -quantity;
    }

    // calculate new quantity
    const newQuantity = currentQuantity + delta;

    if (newQuantity < 0){
        throw new Error("Insufficient stock");
    }

    await client.query(
        ` UPDATE inventory
     SET quantity = $1
     WHERE id = $2;`,
     [newQuantity, inventoryId] 
    );

    const transactionResult = await client.query(
    `INSERT INTO inventory_transactions (
        inventory_id,
        type,
        quantity,
        previous_quantity,
        new_quantity,
        reference
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
        id,
        inventory_id,
        type,
        quantity,
        previous_quantity,
        new_quantity,
        reference,
        created_at;`,
    [
        inventoryId,
        type,
        quantity,
        currentQuantity,
        newQuantity,
        reference
    ]
    );
    const transaction = transactionResult.rows[0];


    const updatedInventoryResult = await client.query(
    `SELECT
        id,
        product_id,
        location_id,
        quantity,
        created_at,
        updated_at
     FROM inventory
     WHERE id = $1;`,
    [inventoryId]
);

const updatedInventory = updatedInventoryResult.rows[0];

    await client.query("COMMIT");

    return {
        inventory: updatedInventory,
        transaction
    };
  }  catch(error){
    await client.query("ROLLBACK");
    throw error;

  }  finally{
    client.release();
  }


}

export {
    getInventory,
    createInventory,
    getInventoryById,
    updateInventory,
    createInventoryTransaction,
}