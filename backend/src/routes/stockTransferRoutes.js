import express from "express";
import { createStockTransferController } from "../controllers/stockTransferController";

import { validateCreateStockTransfer } from "../middleware/stockTransferValidation";
const router = express.Router();

router.get("/", validateCreateStockTransfer, 
    createStockTransferController);