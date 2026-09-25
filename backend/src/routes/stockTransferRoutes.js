import express from "express";
import { createStockTransferController } from "../controllers/stockTransferController";

const router = express.Router();

router.get("/",createStockTransferController);