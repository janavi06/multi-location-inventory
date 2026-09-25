import { createStockTransfer } from "../services/stockTransferService.js";

const createStockTransferController = async (req,res) => {
    const {
        sourceInventoryId,
        destinationInventoryId,
        quantity
    } = req.body

    const result = await createStockTransfer(
        sourceInventoryId,
        destinationInventoryId,
        quantity
    )

    res.status(201).json(result);
}

export {
    createStockTransferController
}