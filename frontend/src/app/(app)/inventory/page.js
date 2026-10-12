"use client";

import { useState, useEffect } from "react";
import Products from "../products/page";

export default function Inventory() {

    const [inventory, setInventory] = useState([]);
    const [error, setError] = useState("");
    const [selectedLocationId, setSelectedLocationId] = useState("");
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [newLocationId, setNewLocationId] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [products, setProducts] = useState([]);



    const fetchInventory = async () => {
        setError("");
        setLoading(true)

        let url;

        if (selectedLocationId === "") {
            url = "http://localhost:5000/api/inventory";
        } else {
            url = `http://localhost:5000/api/inventory?locationId=${selectedLocationId}`;
        }

        const token = localStorage.getItem("token");


        try {


            const response = await fetch(
                url,

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

            setInventory(data);

        } catch (error) {
            setError("Unable to connect to server")

        } finally {
            setLoading(false)
        }



    }

    const fetchLocations = async () => {

        const token = localStorage.getItem("token")


        const response = await fetch(
            "http://localhost:5000/api/locations",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        const data = await response.json();

        if (!response.ok) {
            setError(data.message);
            return
        }

        setLocations(data);

    }

    const fetchProducts = async () => {

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

        setProducts(data);
    }

    useEffect(() => {
        fetchLocations();
        fetchProducts();
    }, [])


    useEffect(() => {
        fetchInventory();
    }, [selectedLocationId]);

    const resetForm = () => {
        setSelectedProductId("");
        setNewLocationId("");
        setQuantity(0);
    }


    const handleCreateInventory = async (event) => {
        event.preventDefault();
        setError("");


const inventoryData = {
    product_id: Number(selectedProductId),
    location_id: Number(newLocationId),
    quantity: Number(quantity)
};


        const token = localStorage.getItem("token")


        try {
            const response = await fetch(
                "http://localhost:5000/api/inventory",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(inventoryData)
                }
            )

            const data = await response.json();

            if (!response.ok) {
                setError(data.message);
                return;
            }

            await fetchInventory();
            resetForm();

        } catch (error) {
            setError("Unable to connect to server")

        }


    };




    return (
        <>
            <h1>Inventory</h1>

            <select
                value={selectedLocationId}
                onChange={(event) => setSelectedLocationId(event.target.value)}
            >
                <option value="">All Locations</option>

                {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                        {location.name}
                    </option>
                ))}
            </select>



            <select
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
            >
                <option value=""> All products</option>

                {products.map((product) => (
                    <option key={product.id} value={product.id}>
                        {product.name}
                    </option>
                ))}

            </select>

            <form
            className="data-card"
            onSubmit={handleCreateInventory}>
                <h2>Create Inventory</h2>

                <div>
                    <label>Product</label>
                    <select
                        value={selectedProductId}
                        onChange={(event) =>
                            setSelectedProductId(event.target.value)
                        }
                        required
                    >
                        <option value="">Select Product</option>

                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Location</label>
                    <select
                        value={newLocationId}
                        onChange={(event) =>
                            setNewLocationId(event.target.value)
                        }
                        required
                    >
                        <option value="">Select Location</option>

                        {locations.map((location) => (
                            <option key={location.id} value={location.id}>
                                {location.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Quantity</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={quantity}
                        onChange={(event) =>
                            setQuantity(event.target.value)
                        }
                        required
                    />
                </div>

                <button type="submit">Create Inventory</button>
            </form>


            {loading ? (
                <p>Loading inventory...</p>
            ) : error ? (
                <p>{error}</p>
            ) : inventory.length === 0 ? (
                <p>No inventory found.</p>
            ) : (
                inventory.map((item) => {
                    const product = products.find(
                        (product) =>
                            Number(product.id) === Number(item.product_id)
                    );

                    const location = locations.find(
                        (location) =>
                            Number(location.id) === Number(item.location_id)
                    );

                    const isLowStock = product
                        ? Number(item.quantity) <= Number(product.low_stock_threshold)
                        : false;

                    return (
                        <div key={item.id} className="data-card">
                            <h3>Inventory #{item.id}</h3>

                            <p>
                                Product:{" "}
                                {product ? product.name : "Unknown product"}
                            </p>

                            <p>
                                Location:{" "}
                                {location ? location.name : "Unknown location"}
                            </p>

                            <p>Quantity: {item.quantity}</p>


                            <p>
                                Status:{" "}
                                {isLowStock ? (
                                    <span className="status-low-stock">Low Stock</span>
                                ) : (
                                    <span className="status-in-stock">In Stock</span>
                                )}
                            </p>
                        </div>
                    );
                })
            )}

            {/* {inventory.map((item) => (
            <div key={item.id}>
                <p>Inventory ID: {item.id}</p>
                <p>Product ID: {item.product_id}</p>
                <p>Location ID: {item.location_id}</p>
                <p>Quantity: {item.quantity}</p>
            </div>
        ))} */}





        </>
    );
}