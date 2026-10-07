import { loginUser, registerUser } from "../services/authService.js";
import asyncHandler from "../utils/asyncHandler.js";
import pool from "../config/db.js";
import AppError from "../utils/AppError.js";

const registerController = asyncHandler(async (req, res) => {

    const {name,
        email,
        password,
        locationId
    } = req.body;

    const register = await registerUser(
        name,
        email,
        password,
        locationId
    );
    return res.status(201).json(register);

});

const loginController = asyncHandler(async (req,res) => {
    const {email, password} = req.body;

    const login = await loginUser(
        email,
        password
    );
    return res.status(200).json(result);
})

const meController = asyncHandler(async (req,res) => {
    const userId = req.user.userId;
    const result = await pool.query(
    `SELECT
        id,
        name,
        email,
        role,
        location_id,
        is_active,
        created_at
    FROM users
    WHERE id = $1`,
    [userId]
);

if (result.rows.length === 0) {
    throw new AppError("User not found", 404);
}
return res.status(200).json(result.rows[0]);

})

export { registerController, loginController, meController };