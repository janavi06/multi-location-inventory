import pool from "../../config/db";

const getUsers = async () => {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            role,
            location_id,
            is_active,
            created_at
        FROM users
        ORDER BY id;
        `
    );

    return result.rows;
};

const getUserById = async (id) => {
    
    const result = await pool.query(
        `
        SELECT 
        id,
        name,
        email,
        role,
        location_id,
        is_active,
        created_at

        FROM users
        WHERE id = $1;
        `,
        [id]
    );

    const user = result.rows[0];

    if (!user){
        throw new AppError("User not found",404);
    }

    return user;

}


const updateUser = async (
    id,
    name,
    role,
    locationId,
    isActive
) => {

    // 1. Check whether user exists
    const existingResult = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            role,
            location_id,
            is_active
        FROM users
        WHERE id = $1;
        `,
        [id]
    );

    const existingUser = existingResult.rows[0];

    if (!existingUser) {
        throw new AppError("User not found", 404);
    }


    // 2. If locationId is provided, verify that location exists
    if (locationId !== undefined && locationId !== null) {

        const locationResult = await pool.query(
            `
            SELECT id
            FROM locations
            WHERE id = $1;
            `,
            [locationId]
        );

        if (locationResult.rows.length === 0) {
            throw new AppError("Location not found", 404);
        }
    }


    // 3. Decide the final values
    const updatedName =
        name ?? existingUser.name;

    const updatedRole =
        role ?? existingUser.role;

    const updatedLocationId =
        locationId === undefined
            ? existingUser.location_id
            : locationId;

            if (
    updatedRole !== "ADMIN" &&
    updatedLocationId === null
) {
    throw new AppError(
        "MANAGER and STAFF users must have a location",
        400
    );
}

    const updatedIsActive =
        isActive ?? existingUser.is_active;


    // 4. Update user
    const updatedResult = await pool.query(
        `
        UPDATE users
        SET
            name = $1,
            role = $2,
            location_id = $3,
            is_active = $4,
            updated_at = NOW()
        WHERE id = $5
        RETURNING
            id,
            name,
            email,
            role,
            location_id,
            is_active,
            created_at,
            updated_at;
        `,
        [
            updatedName,
            updatedRole,
            updatedLocationId,
            updatedIsActive,
            id
        ]
    );

    return updatedResult.rows[0];
};

export {getUsers,
    getUserById,
    updateUser,
}