import { createStockTransfer } from "../services/stockTransferService.js";


const createStockTransferController = async (req, res) => {
    console.log("1. Stock transfer controller reached");
    console.log("2. Request body:", req.body);
    console.log("3. User:", req.user);

    const {
        sourceInventoryId,
        destinationInventoryId,
        quantity
    } = req.body;

    console.log("4. Calling createStockTransfer service");

    const result = await createStockTransfer(
        sourceInventoryId,
        destinationInventoryId,
        quantity,
        req.user.locationId,
        req.user.role
    );

    console.log("5. Transfer service completed");

    res.status(201).json(result);
};


export {
    createStockTransferController
}