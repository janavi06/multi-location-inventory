import express from "express";
import { getInventoryController,
    createInventoryController,
    getInventoryByIdController,
    updateInventoryController,
    createInventoryTransactionController,

 } from "../controllers/inventoryController.js";


const router = express.Router();

router.get("/", getInventoryController);
router.post("/", createInventoryController);
router.get("/:id", getInventoryByIdController);
router.patch("/:id", updateInventoryController);
router.post("/:id/transactions", createInventoryTransactionController);

export default router;