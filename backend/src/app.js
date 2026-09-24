import express from "express";
import productRouter from "./routes/productRoutes.js";
import locationRouter from "./routes/locationRoutes.js"
const app = express();

app.use(express.json());
app.use("/api/products", productRouter);
app.use("/api/locations",locationRouter);


export default app;
