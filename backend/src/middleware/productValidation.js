
const validateCreateProduct = (req,res,next) => {

    const {
        name,
        sku,
        unit,
        lowStockThreshold,
        price
    } = req.body;

    if (!(typeof name === "string")){
        return res.status(400).json({
            message: "Product name must be a string"
        })
    }


    if (name.trim() === ""){
        return res.status(400).json({
            message: "Product name cannot be empty"
        })
    }

    if (!(typeof sku === "string")){
        return res.status(400).json({
            message: "Product SKU must be string"
        })
    }

    if (sku.trim() === ""){
        return res.status(400).json({
                message: "Product SKU cannot be empty"
            })

    }

    if (!(typeof unit === "string")){
        return res.status(400).json({
            message: "Product unit must be string"
        })
    }

    if (unit.trim() === ""){
        return res.status(400).json({
            message: "Product unit cannot be empty"
        })
    }

    if (!Number.isFinite(lowStockThreshold) || 
     lowStockThreshold < 0){
        return res.status(400).json({
            message: "lowStockThreshold must be non-negative number"
        })

    }

     if (!Number.isFinite(price) || 
     price < 0){
        return res.status(400).json({
            message: "price must be non-negative number"
        })

    }

    next();
}


const validateUpdateProduct = (req, res, next) => {
    const {
        name,
        sku,
        unit,
        lowStockThreshold,
        price,
        isActive
    } = req.body;

    if (name === undefined &&

        sku === undefined &&
        unit === undefined &&
        lowStockThreshold === undefined &&
        price === undefined &&
        isActive === undefined
    ) {
        return res.status(400).json({
            message: "At leat one field is required for update"
        })
        
    }

    if (name !== undefined && typeof name !== "string"){
        return res.status(400).json({
            message:"Product name must be string"
        })
    }

    if (name !== undefined && name.trim() === ""){
        return res.status(400).json({
            message: "Product name cannot be empty"
        })
    }

     if (sku !== undefined && typeof sku !== "string"){
        return res.status(400).json({
            message:"Product sku must be string"
        })
    }

    if (sku !== undefined && sku.trim() === ""){
        return res.status(400).json({
            message: "Product sku cannot be empty"
        })
    }

     if (unit !== undefined && typeof unit !== "string"){
        return res.status(400).json({
            message:"Product unit must be string"
        })
    }

    if (unit !== undefined && unit.trim() === ""){
        return res.status(400).json({
            message: "Product unit cannot be empty"
        })
    }

    if ( lowStockThreshold !== undefined &&
       ( !Number.isFinite(lowStockThreshold) ||
            lowStockThreshold < 0)
        ){
            return res.status(400).json({
                message: "lowStockThreshold must be a non-negative number"
            })
        }

         if ( price !== undefined &&
       ( !Number.isFinite(price) ||
            price < 0)
        ){
            return res.status(400).json({
                message: "price must be a non-negative number"
            })
        }

        if (isActive !== undefined && typeof isActive !== "boolean"){
            return res.status(400).json({
                message: "isActive must be boolean"
            })
        }

        next();
};





export {validateCreateProduct,
    validateUpdateProduct
};
