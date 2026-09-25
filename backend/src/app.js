import express from "express";
import productRouter from "./routes/productRoutes.js";
import locationRouter from "./routes/locationRoutes.js";
import inventoryRouter from "./routes/inventoryRoutes.js";
const app = express();

app.use(express.json());
app.use("/api/products", productRouter);
app.use("/api/locations",locationRouter);
app.use("/api/inventory", inventoryRouter);


export default app;
