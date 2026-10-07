import express from "express";
import {
    createOrderController, getOrderByIdController,
    getOrdersController, cancelOrderController,
    confirmOrderController

} from "../controllers/orderController.js";

import { validateCreateOrder } from "../middleware/orderValidation.js";
import { validateId } from "../middleware/idValidation.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireLocation } from "../middleware/locationMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    requireLocation("locationId", "body"),
    validateCreateOrder,
    createOrderController
);


router.get(
    "/:id",
    authMiddleware,
    validateId,
    getOrderByIdController
);

router.get("/",
    authMiddleware,
    getOrdersController);

router.patch(
    "/:id/cancel",
    authMiddleware,
    requireRole("ADMIN", "MANAGER"),
    validateId,
    cancelOrderController
);

router.patch(
    "/:id/confirm",
    authMiddleware,
    requiredRole("ADMIN", "MANAGER"),
    validateId,
    confirmOrderController
);



export default router;