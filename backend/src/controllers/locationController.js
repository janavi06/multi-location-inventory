import { getLocations, createLocation } from "../services/locationService.js";


const getLocationsController = async (req,res) => {
    const locations = await getLocations();

    res.status(200).json(locations);
}

const createLocationController = async (req,res) => {
    const {name, code, address} = req.body;

    const location = await createLocation(
        name,
        code,
        address
    );
    res.status(201).json(location);
}

export {
    getLocationsController,
    createLocationController
}