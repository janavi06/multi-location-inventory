import pool from "../config/db.js";
import AppError from "../utils/AppError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerUser = async (name, email, password, locationId) => {

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
        `SELECT id FROM users WHERE email = $1`,
        [normalizedEmail]
    );

    if (result.rows.length > 0) {
        throw new AppError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userLocationId = locationId ?? null;

    if (userLocationId === null) {
    throw new AppError(
        "Location is required for STAFF users",
        400
    );
}

const locationResult = await pool.query(
    `
    SELECT id
    FROM locations
    WHERE id = $1;
    AND is_active = TRUE;
    `,
    [userLocationId]
);

if (locationResult.rows.length === 0) {
    throw new AppError("Location not found", 404);
}

    const insertResult = await pool.query(
        `INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        location_id
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
        id,
        name,
        email,
        role,
        location_id,
        is_active,
        created_at`,
        [
            name,
            normalizedEmail,
            hashedPassword,
            "STAFF",
            userLocationId
        ]
    );

    return insertResult.rows[0];
};

const loginUser = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
        `SELECT
    id,
    name,
    email,
    password_hash,
    role,
    location_id,
    is_active
FROM users
WHERE email = $1`,
        [normalizedEmail]
    )

    if (result.rows.length === 0) {
        throw new AppError("Invalid email or password", 401);
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatch) {
        throw new AppError("Invalid email or password", 401);
    }

    if (!user.is_active) {
        throw new AppError("User account is inactive", 403);
    }

     const payload = {
        userId: user.id,
        role: user.role,
        locationId: user.location_id
     }

     const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
        expiresIn: "1h"
    }
);

return {
    user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        locationId: user.location_id
    },
    token
};


}

export { registerUser, loginUser }