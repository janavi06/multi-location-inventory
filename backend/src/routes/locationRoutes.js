import express from "express";
import { getLocationsController, createLocationController,
    getLocationByIdController,
    updateLocationController,
    deactivateLocationController

 } from "../controllers/locationController.js";

const router = express.Router();

router.get("/",getLocationsController);
router.post("/", createLocationController);
router.get("/:id", getLocationByIdController );
router.patch("/:id",updateLocationController);
router.delete("/:id", deactivateLocationController);

export default router;

