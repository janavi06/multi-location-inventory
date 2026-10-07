import { getInventory, createInventory, 
    getInventoryById, updateInventory,
    createInventoryTransaction


 } from "../services/inventoryService.js";

const getInventoryController = async (req,res) => {

    const locationId = req.query.locationId;

    const inventory = await getInventory(locationId);

    res.status(200).json(inventory);
}

const createInventoryController = async (req,res) => {
    const {product_id, location_id, quantity} = req.body;

    const inventory = await createInventory(
        product_id,
        location_id,
        quantity
    );

    res.status(201).json(inventory);
}

const getInventoryByIdController = async (req,res) =>{
    const {id} = req.params;

    const inventory = await getInventoryById(
        id,
        req.user.locationId,
        req.user.role
    )
    res.status(200).json(inventory);

}

const updateInventoryController = async (req,res) => {
    const {id} = req.params;

    const {quantity} = req.body;

    const inventory = await updateInventory(
        quantity,
        id,
        req.user.locationId,
        req.user.role
    );

    res.status(200).json(inventory);

}

const createInventoryTransactionController = async (req,res) => {

    const {id} = req.params;

    const inventoryId = id;

    const { type, quantity, reference} = req.body;

    const result = await createInventoryTransaction(
        inventoryId,
        type,
        quantity,
        reference,
        req.user.locationId,
        req.user.role
    );

    return res.status(200).json(result);

}

export {
    getInventoryController,
    createInventoryController,
    getInventoryByIdController,
    updateInventoryController,
    createInventoryTransactionController,
}