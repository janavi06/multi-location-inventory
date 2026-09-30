import express from "express";
import { getInventoryController,
    createInventoryController,
    getInventoryByIdController,
    updateInventoryController,
    createInventoryTransactionController,

 } from "../controllers/inventoryController.js";

 import { validateCreateInventory,
    validateUpdateInventory
  } from "../middleware/inventoryValidation.js";

  import { valdiateId } from "../middleware/idValidation.js";


const router = express.Router();

router.get("/", getInventoryController);

router.post("/", validateCreateInventory, 
    createInventoryController);

router.get("/:id", valdiateId,
    getInventoryByIdController);

router.patch("/:id", valdiateId,
     validateUpdateInventory,
     updateInventoryController);

router.post("/:id/transactions", valdiateId,
    createInventoryTransactionController);

export default router;