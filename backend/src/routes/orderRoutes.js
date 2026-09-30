import express from "express";
import { createOrderController, getOrderByIdController,
    getOrdersController, cancelOrderController

 } from "../controllers/orderController.js";

 import { validateCreateOrder } from "../middleware/orderValidation.js";
import { valdiateId } from "../middleware/idValidation.js";
const router = express.Router();

router.post("/",valdiateId,
    validateCreateOrder,
      createOrderController);

router.get("/:id", valdiateId,
    getOrderByIdController);

router.get("/", getOrdersController);

router.patch("/:id/cancel",valdiateId,
     cancelOrderController);



export default router;