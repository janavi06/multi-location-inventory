"use client";
import { useState, useEffect } from "react";
import Inventory from "../inventory/page";

export default function StockTransfer() {

  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sourceInventoryId, setSourceInventoryId] = useState("");
  const [destinationInventoryId, setDestinationInventoryId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    setError("")
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/inventory",
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
      setLoading(false);
    }
  }

  const fetchProducts = async () => {
    setError("")
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

      setProducts(data);
    } catch (error) {
      setError("Unable to connect to server")

    } finally {
      setLoading(false)
    }
  }

  const fetchLocations = async () => {
    setError("");
    setLoading(true)

    try {
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
        return;
      }

      setLocations(data);
    } catch (error) {
      setError("Unable to connect to server")

    } finally {
      setLoading(false)
    }
  }



  useEffect(() => {
    fetchInventory();
    fetchProducts();
    fetchLocations();
  }, [])

  const resetForm = () => {
    setSourceInventoryId(""),
      setDestinationInventoryId(""),
      setQuantity("")
  }

  const handleCreateStockTransfer = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (sourceInventoryId === "" ||
      destinationInventoryId === "") {
      setError("Please select both source and destination inventory")
      return;
    }


    if (Number(sourceInventoryId) === Number(destinationInventoryId)) {
      setError("Source and destination must be different")
      return;
    }

    if (
      !Number.isFinite(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      setError("Quantity must be a valid number greater than zero.");
      return;
    }

    const transferData = {
      sourceInventoryId: Number(sourceInventoryId),
      destinationInventoryId: Number(destinationInventoryId),
      quantity: Number(quantity)
    }
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const respone = await fetch(
        "http://localhost:5000/api/stock-transfer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(transferData)
        }
      )

      const data = await respone.json();

      if (!respone.ok) {
        setError(data.message);
        return;
      }

      setSuccess("Stock transfer completed successfully.");
      resetForm();
      await fetchInventory();


    } catch (error) {
      setError("Unable to connect to server");

    } finally {
      setSubmitting(false);
    }
  }



  return (
    <>
      <h1> StockTransfer</h1>

      {error && (
    <p className="message-error">{error}</p>
)}


      {success && (
        <p className="message-success">{success}</p>
      )}
      <form className="data-card" onSubmit={handleCreateStockTransfer}>


        {/* Source Inventory */}
        <div>
          <label>Source Inventory</label>

          <select
            value={sourceInventoryId}
            onChange={(event) =>
              setSourceInventoryId(event.target.value)
            }
            required
          >
            <option value="">Select Source Inventory</option>

            {inventory.map((item) => (
              <option key={item.id} value={item.id}>
                Inventory #{item.id} — Quantity: {item.quantity}
              </option>
            ))}
          </select>
        </div>

        {/* Destination Inventory */}
        <div>
          <label>Destination Inventory</label>

          <select
            value={destinationInventoryId}
            onChange={(event) =>
              setDestinationInventoryId(event.target.value)
            }
            required
          >
            <option value="">Select Destination Inventory</option>

            {inventory.map((item) => (
              <option
                key={item.id}
                value={item.id}
                disabled={
                  Number(item.id) === Number(sourceInventoryId)
                }
              >
                Inventory #{item.id} — Quantity: {item.quantity}
              </option>
            ))}
          </select>
        </div>

        {/* Transfer Quantity */}
        <div>
          <label>Quantity to Transfer</label>

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Transferrring..."
            : "Create Transfer"
          }
        </button>




      </form>
    </>
  )
}