import express from "express";
import {
    getUsersController,
    getUserByIdController,
    updateUserController
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validateId } from "../middleware/idValidation.js";
import { validateUpdateUser } from "../middleware/userValidation.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    requireRole("ADMIN"),
    getUsersController
);

router.get(
    "/:id",
    authMiddleware,
    requireRole("ADMIN"),
    validateId,
    getUserByIdController
);

router.patch(
    "/:id",
    authMiddleware,
    requireRole("ADMIN"),
    validateId,
    validateUpdateUser,
    updateUserController
);
export default router;