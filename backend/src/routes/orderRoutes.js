import express from "express";
import { createOrderController, getOrderByIdController,
    getOrdersController, cancelOrderController

 } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrderController);
router.get("/:id", getOrderByIdController);
router.get("/", getOrdersController);
router.patch("/:id/cancel", cancelOrderController);



export default router;