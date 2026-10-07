import express from "express";
import {
    registerController,
    loginController,
    meController
} from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middleware/authValidation.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


router.post(
    "/register",
    validateRegister,
    registerController
);

router.post(
    "/login",
    validateLogin,
    loginController
);

router.get(
    "/me",
    authMiddleware,
    meController
);


export default router;