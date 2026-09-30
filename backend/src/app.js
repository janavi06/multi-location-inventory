import express from "express";
import productRouter from "./routes/productRoutes.js";
import locationRouter from "./routes/locationRoutes.js";
import inventoryRouter from "./routes/inventoryRoutes.js";
import stockTransferRouter from "./routes/stockTransferRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use("/api/products", productRouter);
app.use("/api/locations",locationRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/stock-transfer", stockTransferRouter);
app.use("/api/orders", orderRouter);
app.use(errorHandler);


export default app;
