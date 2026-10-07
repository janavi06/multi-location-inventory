import asyncHandler from "../utils/asyncHandler.js";
import { syncOperation } from "../services/syncService.js";

const syncOperationController = asyncHandler(async (req, res) => {

    const {
        operationId,
        type,
        payload
    } = req.body;

    const userId = req.user.userId;
    const locationId = req.user.locationId;
    const role = req.user.role;

    const result = await syncOperation(
        operationId,
        type,
        payload,
        userId,
        locationId,
        role
    );

    return res.status(200).json(result);
});

export {
    syncOperationController
};