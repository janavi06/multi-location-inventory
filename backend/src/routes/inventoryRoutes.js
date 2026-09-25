import express from "express";
import { getInventoryController,
    createInventoryController,
    getInventoryByIdController,
    updateInventoryController

 } from "../controllers/inventoryController.js";


const router = express.Router();

router.get("/", getInventoryController);
router.post("/", createInventoryController);
router.get("/:id", getInventoryByIdController);
router.patch("/:id", updateInventoryController);

export default router;