import express from "express";
import { getLocationsController, createLocationController } from "../controllers/locationController.js";

const router = express.Router();

router.get("/",getLocationsController);
router.post("/", createLocationController);

export default router;

