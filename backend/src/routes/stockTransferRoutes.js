import express from "express";
import { createStockTransferController } from "../controllers/stockTransferController.js";
import { validateCreateStockTransfer } from "../middleware/stockTransferValidation.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use((req, res, next) => {
    console.log(
        "Stock transfer route reached:",
        req.method,
        req.originalUrl
    );
    next();
});


router.post(
    "/",
    authMiddleware,
    requireRole("ADMIN", "MANAGER"),
    validateCreateStockTransfer,
    createStockTransferController
);

export default router