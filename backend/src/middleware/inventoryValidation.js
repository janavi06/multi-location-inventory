

const validateCreateInventory = (req,res,next) => {
    const {productId, locationId, quantity} = req.body;

    if (!(Number.isInteger(productId) && productId > 0)){
        return res.status(400).json({
            message: "productId must be a positive integer"
        })
    }

      if (!(Number.isInteger(locationId) && locationId > 0)){
        return res.status(400).json({
            message: "locationId must be a positive integer"
        })
    }

    if (!(Number.isFinite(quantity)) || quantity < 0){
        return res.status(400).json({
            message: "quantity must be non-negative number"
        })
    }

    next();
}

const validateUpdateInventory = (req,res,next) => {
    const {
        productId,
        locationId,
        quantity
    } = req.body;

    if (productId === undefined &&
        locationId === undefined &&
        quantity === undefined 
    ) {
        return res.status(400).json({
            message: "At least one field is requried for update"
        })
    }

    if (productId !== undefined &&
        (!(Number.isInteger(productId) && productId > 0))
     ) {
        return res.status(400).json({
            message: "productId must be positive integer"
        })
     }

     if (locationId !== undefined &&
        (!(Number.isInteger(locationId) && locationId > 0))
     ) {
        return res.status(400).json({
            message: "locationId must be positive integer"
        })
     }

     if (quantity !== undefined && 
        (!Number.isFinite(quantity) || quantity < 0)
     ){
        return res.status(400).json({
            message: "quantity must be non-negative number"
        })
     }

     next();
}

export {validateCreateInventory,
    validateUpdateInventory
}