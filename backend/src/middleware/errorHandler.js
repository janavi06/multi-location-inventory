import AppError from "../utils/AppError.js";

const errorHandler = (err,req,res,next) => {
const statusCode = err instanceof AppError
    ? err.statusCode
    : 500;

const message = err instanceof AppError
    ? err.message
    : "Internal server error";

     return res.status(statusCode).json({
        message: message
    });
}

export {errorHandler};