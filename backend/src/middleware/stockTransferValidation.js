

const validateCreateStockTransfer = (req,res,next) => {
    const {
        sourceInventoryId,
        destinationInventoryId,
        quantity
    } = req.body


    if (!(Number.isInteger(sourceInventoryId) &&
        sourceInventoryId > 0)
       ) {
        return res.status(400).json({
            message: "sourceInventoryId must be a postivie integer"
        })
       }

       if (!(Number.isInteger(destinationInventoryId) &&
        destinationInventoryId > 0)
       ) {
        return res.status(400).json({
            message: "destinationInventoryId must be a postivie integer"
        })
       }

       if (!Number.isFinite(quantity) || quantity <= 0){
        return res.status(400).json({
            message: "quantity must be a positive number"
        })
       }
}

export {validateCreateStockTransfer}