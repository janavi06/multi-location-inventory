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
const getLocationById = async () => {

} 

// update location

const updateLocation = async () => {

}

export {
    getLocations,
    createLocation,
    getLocationById,
    updateLocation
}