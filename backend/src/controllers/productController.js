import { getProducts, createProduct,
    getProductById, updateProduct,
    deactivateProduct

 } from "../services/productService.js";


const getProductsController = async (req, res) => {
   
const products = await getProducts();

res.status(200).json(products);
}

// create product
const createProductController = async (req,res) => {

    const {name, sku, unit, low_stock_threshold} = req.body;

    const product = await createProduct(
        name,
        sku,
        unit,
        low_stock_threshold
    );
    res.status(201).json(product);
}

const getProductByIdController = async (req,res) => {
    const {id} = req.params;

    const product = await getProductById(id);

    res.status(200).json(product);

}

const updateProductController = async (req, res) => {
    const {id} = req.params;

    const {name, unit, low_stock_threshold} = req.body;

    const product = await updateProduct(
        name,
        unit,
        low_stock_threshold,
        id
    )
    res.status(200).json(product);
}

const deactivateProductController = async (req,res) => {
    const {id} = req.params;

    const product = await deactivateProduct(id);
    res.status(200).json(product);

}

export {
    getProductsController,
    createProductController,
    getProductByIdController,
    updateProductController,
    deactivateProductController
};