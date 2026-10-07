import express from "express";
import { createStockTransferController } from "../controllers/stockTransferController";
import { validateCreateStockTransfer } from "../middleware/stockTransferValidation";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();


router.post(
    "/",
    authMiddleware,
    requireRole("ADMIN", "MANAGER"),
    validateCreateStockTransfer,
    createStockTransferController
);