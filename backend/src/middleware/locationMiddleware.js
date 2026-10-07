import AppError from "../utils/AppError.js";



const requireLocation = (fieldName, source) => {
    return (req, res, next) => {

const requestedLocationId =
    source === "query"
        ? req.query[fieldName]
        : req.body[fieldName];
        if (req.user.role === "ADMIN") {
            return next();
        }

          if (requestedLocationId === undefined) {
            throw new AppError("locationId is required", 400);
        }

        if (Number(requestedLocationId) !== Number(req.user.locationId)) {
            throw new AppError(
                "Access denied for this location",
                403
            );
        }

        next();
    };
};

export { requireLocation };