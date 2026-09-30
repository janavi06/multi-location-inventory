import express from "express";
import { getLocationsController, createLocationController,
    getLocationByIdController,
    updateLocationController,
    deactivateLocationController

 } from "../controllers/locationController.js";

 import { createLocationController } from "../controllers/locationController.js";
import { validateCreateLocation,
    validateUpdateLocation
 } from "../middleware/locationValidation.js";

 import { valdiateId } from "../middleware/idValidation.js";

const router = express.Router();

router.get("/",getLocationsController);

router.post("/", validateCreateLocation, 
    createLocationController);

router.get("/:id", valdiateId,
     getLocationByIdController );

router.patch("/:id", valdiateId, validateCreateLocation,
    updateLocationController);


router.delete("/:id", valdiateId,
    deactivateLocationController);

export default router;

