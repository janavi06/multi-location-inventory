import express from "express";
import {getProductsController,
    createProductController,
    getProductByIdController,
    updateProductController,
    deactivateProductController
} from "../controllers/productController.js"

import { validateCreateProduct,
    validateUpdateProduct
 } from "../middleware/productValidation.js";

 import { valdiateId } from "../middleware/idValidation.js";

const router = express.Router();

router.get("/", getProductsController);

router.post("/", validateCreateProduct, createProductController);

router.get("/:id", valdiateId,
     getProductByIdController);

router.patch("/:id", valdiateId, 
    validateCreateProduct,
     updateProductController);

router.delete("/:id", valdiateId,
     deactivateProductController);


export default router; 