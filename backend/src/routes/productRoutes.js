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

 import { validateId } from "../middleware/idValidation.js";

 import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/:id",
    authMiddleware,
    validateId,
    getProductByIdController
);


router.post(
    "/",
    authMiddleware,
    requireRole("ADMIN", "MANAGER"),
    validateCreateProduct,
    createProductController
);
router.get("/:id", validateId,
     getProductByIdController);

router.patch(
    "/:id",
    authMiddleware,
    requireRole("ADMIN", "MANAGER"),
    validateId,
    validateUpdateProduct,
    updateProductController
);

router.delete(
    "/:id",
    authMiddleware,
    requireRole("ADMIN"),
    validateId,
    deactivateProductController
);


export default router; 