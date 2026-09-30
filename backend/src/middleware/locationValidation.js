

const validateCreateLocation = (req, res, next) => {

    const { name, code, address } = req.body;


    if (!(typeof name === "string")) {
        return res.status(400).json({
            message: "Location name must be string"
        });
    }

    if (name.trim() === "") {
        return res.status(400).json({
            message: "Location name cannot be empty"
        })
    }


    if (!(typeof code === "string")) {
        return res.status(400).json({
            message: "Location code must be string"
        });
    }

    if (code.trim() === "") {
        return res.status(400).json({
            message: "Location code cannot be empty"
        })
    }

    if (!(typeof address === "string")) {
        return res.status(400).json({
            message: "Location address must be string"
        });
    }

    if (address.trim() === "") {
        return res.status(400).json({
            message: "Location address cannot be empty"
        })
    }

    next();

}

const validateUpdateLocation = (req, res, next) => {
    const {
        name,
        code,
        address,
        isActive
    } = req.body

    if (name === undefined &&
    code === undefined &&
    address === undefined &&
    isActive === undefined){
        return res.status(400).json({
            message: "At least one field is required for update"
        })
    }

      if (name !== undefined && typeof name !== "string"){
        return res.status(400).json({
            message:"Location name must be string"
        })
    }

    if (name !== undefined && name.trim() === ""){
        return res.status(400).json({
            message: "Location name cannot be empty"
        })
    }

        if (code !== undefined && typeof code !== "string"){
        return res.status(400).json({
            message:"Location code must be string"
        })
    }

    if (code !== undefined && code.trim() === ""){
        return res.status(400).json({
            message: "Location code cannot be empty"
        })
    }

     if (address !== undefined && typeof address !== "string"){
        return res.status(400).json({
            message:"Location address must be string"
        })
    }

    if (address !== undefined && address.trim() === ""){
        return res.status(400).json({
            message: "Location address cannot be empty"
        })
    }

       if (isActive !== undefined && typeof isActive !== "boolean"){
            return res.status(400).json({
                message: "isActive must be boolean"
            })
        }

        next();
}





export { validateCreateLocation,
    validateUpdateLocation
 }