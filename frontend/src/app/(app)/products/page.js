"use client";
import { useState, useEffect } from "react";


export default function Products() {

    const [products, setProducts] = useState([]);

    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [unit, setUnit] = useState("");
    const [lowStockThreshold, setLowStockThreshold] = useState(0);
    const [price, setPrice] = useState(0);
    const [error, setError] = useState("");
    const [editingProductId, setEditingProductId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState("");

    const fetchProducts = async () => {
        setError("");
       setLoading(true)

       try {

        const token = localStorage.getItem("token")

         const response = await fetch(
            "http://localhost:5000/api/products",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        const data = await response.json();

         if (!response.ok) {
            setError(data.message);
            return;
        }
        
        setProducts(data)
        
       } catch (error) {
        setError("Unable to connect to the server")
        
       } finally {
        setLoading(false)
       }
    }

    useEffect(() => {

        fetchProducts();
    }, [])

     const resetForm = () => {
    setName("");
    setSku("");
    setUnit("");
    setLowStockThreshold(0);
    setPrice(0);
    setEditingProductId(null);
    setError("");
};


const handleDeactivateProduct = async (productId) => {
    setError("");
    setSuccess("");

    try {

        const token = localStorage.getItem("token")

        const response = await fetch(
            `http://localhost:5000/api/products/${productId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    isActive: false
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            setError(data.message);
            return;
        }
        setSuccess("Product deactivated successfully");

        await fetchProducts();

    } catch (error) {
        setError("Unable to connect to the server");
    }
};


    const handleCreateProduct = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        const productData = {
            name,
            sku,
            unit,
            lowStockThreshold: Number(lowStockThreshold),
            price: Number(price)

        }

        const token = localStorage.getItem("token")


        let method;
        let url;

        if (editingProductId === null) {
            method = "POST";
            url = "http://localhost:5000/api/products";
        } else {
            method = "PATCH";
            url = `http://localhost:5000/api/products/${editingProductId}`;
        }

        
        const response = await fetch(
            url,
            {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            }
        )
        const data = await response.json();

//         const responseText = await response.text();
// console.log("Status:", response.status);
// console.log("Response body:", responseText);

// const data = responseText ? JSON.parse(responseText) : {};

        if (!response.ok) {
            setError(data.message);
            return;
        }

        setSuccess(
    editingProductId === null
        ? "Product created successfully"
        : "Product updated successfully"
);

        await fetchProducts();
        resetForm();




    }

   

return (
    <>
        <h1>Products</h1>

        {success && <p className="message-success">{success}</p>}

        {loading ? (
            <p>Loading products...</p>
        ) : error ? (
            <p className="message-error">{error}</p>
        ) : products.length === 0 ? (
            <p>No products found.</p>
        ) : (
            products.map((product) => (
                <div key={product.id} className="data-card">
                    <p>Name: {product.name}</p>
                    <p>SKU: {product.sku}</p>
                    <p>Unit: {product.unit}</p>
                    <p>Price: {product.price}</p>

                    <button
                        type="button"
                        onClick={() => {
                            setEditingProductId(product.id);
                            setName(product.name);
                            setSku(product.sku);
                            setUnit(product.unit);
                            setLowStockThreshold(
                                Number(product.low_stock_threshold)
                            );
                            setPrice(Number(product.price));
                            setError("");
                        }}
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        className="button-danger"
                        onClick={() => handleDeactivateProduct(product.id)}
                    >
                        Deactivate
                    </button>
                </div>
            ))
        )}

        <form 
        className="data-card"
        onSubmit={handleCreateProduct}>
            <label>Product Name</label>
            <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
            />

            <label>SKU</label>
            <input
                type="text"
                value={sku}
                onChange={(event) => setSku(event.target.value)}
            />

            <label>Unit</label>
            <input
                type="text"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
            />

            <label>Low Stock Threshold</label>
            <input
                type="number"
                value={lowStockThreshold}
                onChange={(event) =>
                    setLowStockThreshold(event.target.value)
                }
            />

            <label>Price</label>
            <input
                type="number"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
            />

            <button type="submit">
                {editingProductId === null
                    ? "Create Product"
                    : "Update Product"}
            </button>

            {editingProductId !== null && (
                <button
                    type="button"
                    className="button-secondary"
                    onClick={resetForm}
                >
                    Cancel Edit
                </button>
            )}
        </form>
    </>
);

}