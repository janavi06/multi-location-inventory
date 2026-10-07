import jwt from "jsonwebtoken";
import AppError from "../utils/AppError";

const authMiddleware = (req,res,next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new AppError("Authentication required", 401);
    }

    const [scheme, token] = authHeader.split(" ");

if (scheme !== "Bearer" || !token) {
    throw new AppError("Invalid authentication token", 401);
}

try {
    const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
);
req.user = decoded;

next();
    
} catch (error) {
        throw new AppError("Invalid or expired token", 401);
}
}