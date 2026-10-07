const validateUpdateUser = (req, res, next) => {

    const {
        name,
        role,
        locationId,
        isActive
    } = req.body;

    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            message: "Request body cannot be empty"
        });
    }

    if (name !== undefined) {
        if (typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({
                message: "name must be a non-empty string"
            });
        }
    }

    if (role !== undefined) {
        const allowedRoles = ["ADMIN", "MANAGER", "STAFF"];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }
    }

    if (locationId !== undefined && locationId !== null) {
        if (!(Number.isInteger(locationId) && locationId > 0)) {
            return res.status(400).json({
                message: "locationId must be a positive integer or null"
            });
        }
    }

    if (isActive !== undefined) {
        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be a boolean"
            });
        }
    }

    next();
};

export {
    validateUpdateUser
};