const validateSyncOperation = (req, res, next) => {

    const {
        operationId,
        type,
        payload
    } = req.body;


    // 1. Validate operationId
    if (
        typeof operationId !== "string" ||
        operationId.trim() === ""
    ) {
        return res.status(400).json({
            message: "operationId must be a non-empty string"
        });
    }


    // 2. Validate type
    if (
        typeof type !== "string" ||
        type.trim() === ""
    ) {
        return res.status(400).json({
            message: "type must be a non-empty string"
        });
    }

    const allowedTypes = [
        "SALE",
        "RETURN",
        "TRANSFER"
    ];

    if (!allowedTypes.includes(type)) {
        return res.status(400).json({
            message: "Invalid sync operation type"
        });
    }


    // 3. Validate payload
    if (
        payload === undefined ||
        payload === null ||
        typeof payload !== "object" ||
        Array.isArray(payload)
    ) {
        return res.status(400).json({
            message: "payload must be a non-null object"
        });
    }


    next();
};

export {
    validateSyncOperation
};