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

import authMiddleware from "../middleware/authMiddleware.js"
import { requireRole } from "../middleware/roleMiddleware.js";
import valdiateId from "../middleware/idValidation.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getProductsController
);

router.get(
    "/:id",
    authMiddleware,
    valdiateId,
    getProductByIdController
);


router.post(
    "/",
    authMiddleware,
    requireRole("ADMIN", "MANAGER"),
    validateCreateProduct,
    createProductController
);
router.get("/:id", valdiateId,
     getProductByIdController);

router.patch(
    "/:id",
    authMiddleware,
    requireRole("ADMIN", "MANAGER"),
    valdiateId,
    validateUpdateProduct,
    updateProductController
);

router.delete(
    "/:id",
    authMiddleware,
    requireRole("ADMIN"),
    valdiateId,
    deactivateProductController
);


export default router; 