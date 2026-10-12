"use client";
import { useState, useEffect } from "react";

export default function Orders() {

    const [orders, setOrders] = useState([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [locations, setLocations] = useState([])
    const [selectedLocationId, setSelectedLocationId] = useState("");
    const [selectedProductId, setSelectedProductId] = useState("");
    const [itemQuantity, setItemQuantity] = useState("");
    const [orderItems, setOrderItems] = useState([]);
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        setError("");
        setLoading(true)

        try {

            const token = localStorage.getItem("token")

            const response = await fetch(
                "http://localhost:5000/api/orders",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();

            if (!response.ok) {
                setError(data.message);
                return;
            }
            setOrders(data)

        } catch (error) {

            setError("Unable to connect to server")

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders();

    }, [])

    const handleConfirmOrder = async (orderId) => {
        setError("");

        try {

            const token = localStorage.getItem("token")

            const response = await fetch(
                `http://localhost:5000/api/orders/${orderId}/confirm`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            const data = await response.json();

            if (!response.ok) {
                setError(data.message)
                return;
            }

            await fetchOrders();

        } catch (error) {
            setError("Unable to connect to server")

        }

    }

    const handleCancelOrder = async (orderId) => {
        setError("");

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/orders/${orderId}/cancel`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }

                }
            )

            const data = await response.json();

            if (!response.ok) {
                setError(data.message)
            }
            await fetchOrders();

        } catch (error) {
            setError("Unable to connect to server")

        }

    }

    const fetchProducts = async () => {

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

            setProducts(data);
        } catch (error) {

            setError("Unable to connect to server")

        }
    }

    const fetchLocations = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                "http://localhost:5000/api/locations",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setError(data.message)
                return;
            }

            setLocations(data);

        } catch (error) {
            setError("Unable to connect to server")
        }
    }

    useEffect(() => {
        fetchProducts();
        fetchLocations();
    }, [])

    const resetForm = () => {
        setSelectedLocationId("");
        setSelectedProductId("");
        setItemQuantity("");
        setOrderItems([]);
    }

    const handleAddItem = () => {
        setError("")

        if (selectedProductId === "") {
            setError("Please select a Product")
            return
        }

        if (
            !Number.isFinite(Number(itemQuantity)) ||
            Number(itemQuantity) <= 0
        ) {
            setError("Quantity must be a valid number greater than zero.");
            return;
        }

        const newItem = {
            productId: Number(selectedProductId),
            quantity: Number(itemQuantity)
        }

        setOrderItems((previousItems) => [...previousItems, newItem]);

        setSelectedProductId("");
        setItemQuantity("");
    }

    const handleRemoveItem = (index) => {

        setOrderItems((previousItems) => {
            previousItems.filter(
                (_, currentIndex) => currentIndex !== index
            )
        })

    }

    const handleCreateOrder = async (event) => {
        event.preventDefault()
        setError("")
        setSuccess("")

        if (selectedLocationId === "") {
            setError("Please select a location")
            return
        }

        if (orderItems.length === 0) {
            setError("Please add atleast one item to the order");
            return;
        }

        const orderData = {
            locationId: Number(selectedLocationId),
            items: orderItems
        }
        setSubmitting(true);

        try {
            const token = localStorage.getItem("token")

            const response = await fetch(
                "http://localhost:5000/api/orders",

                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(orderData)

                }
            )

            const data = await response.json();

            if (!response.ok) {
                setError(data.message)
                return;
            }

            setSuccess("Order created successfully.");
            resetForm();

            await fetchOrders();

        } catch (error) {
            setError("Unable to connect to server")

        } finally {
            setSubmitting(false);
        }

    }

    const handleViewOrderDetails = async (orderId) => {

        setError("");

        try {
            const token = localStorage.getItem("token")

            const response = await fetch(
                `http://localhost:5000/api/orders/${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            const data = await response.json();

            if (!response.ok) {
                setError(data.message)
                return
            }

            setSelectedOrder(data);
        } catch (error) {
            setError("Unable to connect to server")

        }
    }



    return (
        <>
            <h1>Orders</h1>

            {loading ? (
                <p>Loading Orders...</p>
            ) : error ? (
                <p className="message-error">{error}</p>
            ) : orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                orders.map((order) => (
                    <div key={order.id} className="data-card">
                        <p>Order ID: {order.id}</p>
                        <p>
                            Order Status:{" "}
                            <span className={`status-${order.status.toLowerCase()}`}>
                                {order.status}
                            </span>
                        </p>                        <p>Total Amount: {order.total_amount}</p>
                        <p>Created At: {order.created_at}</p>

                        {order.status === "PENDING" && (
                            <button
                                type="button"
                                onClick={() => handleConfirmOrder(order.id)}
                            >
                                Confirm Order
                            </button>
                        )}

                        {(order.status === "PENDING" ||
                            order.status === "CONFIRMED") && (
                                <button
                                    type="button"
                                    className="button-danger"
                                    onClick={() => handleCancelOrder(order.id)}
                                >
                                    Cancel Order
                                </button>

                            )}

                        <button
                            type="button"
                            onClick={() => handleViewOrderDetails(order.id)}
                        >
                            View Details
                        </button>
                    </div>
                ))
            )}

            {selectedOrder && (
                <div>
                    <h2>Order Details</h2>

                    <p>Order ID: {selectedOrder.id}</p>
                    <p>Status: {selectedOrder.status}</p>
                    <p>Total Amount: {selectedOrder.total_amount}</p>

                    <h3>Items</h3>

                    {selectedOrder.items.map((item) => {
                        const product = products.find(
                            (product) =>
                                Number(product.id) === Number(item.product_id)
                        );

                        return (
                            <div key={item.id}>
                                <p>
                                    Product: {product ? product.name : "Unknown product"}
                                </p>

                                <p>Quantity: {item.quantity}</p>
                                <p>Unit Price: {item.unit_price}</p>
                                <p>Subtotal: {item.subtotal}</p>
                            </div>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => setSelectedOrder(null)}
                    >
                        Close Details
                    </button>

                </div>
            )}


            <h2>Create Order</h2>

            {success && <p className="message-success">{success}</p>}

            <form className="data-card" onSubmit={handleCreateOrder}>
                {/* Select Location */}
                <div>
                    <label>Location</label>

                    <select
                        value={selectedLocationId}
                        onChange={(event) =>
                            setSelectedLocationId(event.target.value)
                        }
                    >
                        <option value="">Select Location</option>

                        {locations.map((location) => (
                            <option key={location.id} value={location.id}>
                                {location.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Select Product */}
                <div>
                    <label>Product</label>

                    <select
                        value={selectedProductId}
                        onChange={(event) =>
                            setSelectedProductId(event.target.value)
                        }
                    >
                        <option value="">Select Product</option>

                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Item Quantity */}
                <div>
                    <label>Quantity</label>

                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={itemQuantity}
                        onChange={(event) =>
                            setItemQuantity(event.target.value)
                        }
                    />
                </div>

                {/* Add Item */}
                <button type="button" onClick={handleAddItem}>
                    Add Item
                </button>

                {/* Items Added to Order */}
                <h3>Items Added to Order</h3>

                {orderItems.length === 0 ? (
                    <p>No items added yet.</p>
                ) : (
                    orderItems.map((item, index) => {
                        const product = products.find(
                            (product) =>
                                Number(product.id) === Number(item.productId)
                        );

                        return (
                            <div key={`${item.productId}-${index}`}>
                                <p>
                                    Product:{" "}
                                    {product ? product.name : "Unknown product"}
                                </p>

                                <p>Quantity: {item.quantity}</p>

                                <button
                                    type="button"
                                    className="button-secondary"
                                    onClick={() => handleRemoveItem(index)}
                                >
                                    Remove
                                </button>
                            </div>
                        );
                    })
                )}

                {/* Submit Order */}
                <button type="submit" disabled={submitting}>
                    {submitting ? "Creating Order..." : "Create Order"}
                </button>
            </form>
        </>
    );




}