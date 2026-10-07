import express from "express";
import {
    getInventoryController,
    createInventoryController,
    getInventoryByIdController,
    updateInventoryController,
    createInventoryTransactionController,

} from "../controllers/inventoryController.js";

import {
    validateCreateInventory,
    validateUpdateInventory
} from "../middleware/inveinventoryRoutesntoryValidation.js";

import { validateId } from "../middleware/idValidation.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { requireLocation } from "../middleware/locationMiddleware.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    requireLocation("locationId", "query"),
    getInventoryController
);

router.post(
    "/",
    authMiddleware,
    requireRole("ADMIN", "MANAGER"),
    requireLocation("locationId"),
    validateCreateInventory,
    createInventoryController
);

router.get(
    "/:id",
    authMiddleware,
    validateId,
    getInventoryByIdController
);

router.patch(
    "/:id",
    authMiddleware,
    requireRole("ADMIN", "MANAGER"),
    validateId,
    validateUpdateInventory,
    updateInventoryController
);

router.post(
    "/:id/transactions",
    authMiddleware,
    requireRole("ADMIN", "MANAGER"),
    validateId,
    createInventoryTransactionController
);

export default router;