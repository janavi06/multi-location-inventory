import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { validateSyncOperation } from "../middleware/syncValidation.js";
import { syncOperationController } from "../controllers/syncController.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    validateSyncOperation,
    syncOperationController
);

export default router;