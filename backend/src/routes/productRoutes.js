import express from "express";
import {getProductsController,
    createProductController,
    getProductByIdController,
    updateProductController,
    deactivateProductController
} from "../controllers/productController.js"

const router = express.Router();

router.get("/", getProductsController);

router.post("/", createProductController);

router.get("/:id", getProductByIdController);

router.patch("/:id", updateProductController);

router.delete("/:id", deactivateProductController);


export default router; 