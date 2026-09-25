import { getLocations, createLocation, getLocationById, 
    updateLocation, deactivateLocation

 } from "../services/locationService.js";


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

const getLocationByIdController = async (req,res) => {
    const {id} = req.params;

    const location = await getLocationById(id);

    res.status(200).json(location);
}

const updateLocationController = async (req,res) => {

    const {id} = req.params;

    const {name, address} = req.body;

    const location = await updateLocation(
        name,
        address,
        id
    )
    res.status(200).json(location);

}

const deactivateLocationController = async (req,res) => {
    const {id} = req.params;

    const location = await deactivateLocation(id);

    res.status(200).json(location);
}



export {
    getLocationsController,
    createLocationController,
    getLocationByIdController,
    updateLocationController,
    deactivateLocationController
}