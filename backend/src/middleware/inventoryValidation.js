


const validateCreateInventory = (req, res, next) => {
    const { product_id, location_id, quantity } = req.body;

    if (!(Number.isInteger(product_id) && product_id > 0)) {
        return res.status(400).json({
            message: "product_id must be a positive integer"
        });
    }

    if (!(Number.isInteger(location_id) && location_id > 0)) {
        return res.status(400).json({
            message: "location_id must be a positive integer"
        });
    }

    if (!(Number.isFinite(quantity)) || quantity < 0) {
        return res.status(400).json({
            message: "quantity must be a non-negative number"
        });
    }

    next();
};



const validateUpdateInventory = (req, res, next) => {
    const { product_id, location_id, quantity } = req.body;

    if (
        product_id === undefined &&
        location_id === undefined &&
        quantity === undefined
    ) {
        return res.status(400).json({
            message: "At least one field is required for update"
        });
    }

    if (
        product_id !== undefined &&
        !(Number.isInteger(product_id) && product_id > 0)
    ) {
        return res.status(400).json({
            message: "product_id must be a positive integer"
        });
    }

    if (
        location_id !== undefined &&
        !(Number.isInteger(location_id) && location_id > 0)
    ) {
        return res.status(400).json({
            message: "location_id must be a positive integer"
        });
    }

    if (
        quantity !== undefined &&
        (!Number.isFinite(quantity) || quantity < 0)
    ) {
        return res.status(400).json({
            message: "quantity must be a non-negative number"
        });
    }

    next();
};


export {validateCreateInventory,
    validateUpdateInventory
}