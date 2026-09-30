const validateCreateOrder = (req,res,next) => {
     
    const {locationId, items} = req.body;

    if (!(Number.isInteger(locationId) && locationId > 0)){
        return res.status(400).json({
            message: "locationId must be positive integer"
        });
    }

    if (!Array.isArray(items)){
        return res.status(400).json({
            message: "items must be an array"
        });
    }

    if (items.length === 0){
        return res.status(400).json({
            message: "Order must contain atleast one item"
        });
    }

    for (const item of items){

        if (!(item !== null && typeof item== "object")){
            return res.status(400).json({
                message: "Each item must be an object"
            })
        }

        const {productId, quantity} = item;

        if (!(Number.isInteger(productId) && productId > 0)){
            return res.status(400).json({
                message: "productId must be a positive integer"
            })
        }

        if (!(Number.isFinite(quantity) && quantity > 0)){
            return res.status(400).json({
                message: "quantity must be a positive number"
            })
        }

    }

    next();


};

export {validateCreateOrder}