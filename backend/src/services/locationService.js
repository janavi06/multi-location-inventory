import pool from "../../config/db.js"


// get location
const getLocations = async () => {
    const result = await pool.query(
         `SELECT id,name,code,address, 
     is_active FROM locations
     `
    )
    return result.rows;
}

// create location
const createLocation = async (name, code, address) => {
    const result = await pool.query(
        `INSERT INTO locations (
    name,
    code,
    address
)
VALUES ($1, $2, $3)
RETURNING id, name, code, address, is_active;`,
   [name, code, address ]
    )
    return result.rows[0];
}

// get location by id
const getLocationById = async (id) => {

    const result = await pool.query(
        `SELECT
    id,
    name,
    code,
    address,
    is_active
    FROM locations
    WHERE id = $1;`,
    [id]
    )
    return result.rows[0];

} 

// update location
const updateLocation = async (name, address, id) => {
    const result = await pool.query(
        `UPDATE locations
         SET
         name = $1,
         address = $2
         WHERE id = $3
          RETURNING id, name, code, address, is_active;`,
          [name, address, id]
    )
    return result.rows[0];
}

// delete location
const deactivateLocation = async (id) => {
    const result = await pool.query(
        `
        UPDATE locations
       SET is_active = FALSE
       WHERE id = $1
        RETURNING id, name, code, address, is_active;
        `,
        [id]
    )
    return result.rows[0];
}

export {
    getLocations,
    createLocation,
    getLocationById,
    updateLocation,
    deactivateLocation
}