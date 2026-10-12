"use client";

import { useState, useEffect } from "react";

export default function Locations() {

    const [locations, setLocations] = useState([]);
    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [address, setAddress] = useState("");
    const [success, setSuccess] = useState("");
const [editingLocationId, setEditingLocationId] = useState(null);


    const fetchLocations = async () => {
        setError("");
        
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

    }

    useEffect(() => {
        fetchLocations();

    }, []);

        const resetForm = () => {
    setName("");
    setCode("");
    setAddress("");
    setEditingLocationId(null);
    setError("");
};



    const handleCreateLocation = async (event) => {

        event.preventDefault();
        setError("");
        setSuccess("");

        const locationData = {
            name,
            code,
            address
        }
        
        const token = localStorage.getItem("token")

         let method;
        let url;

        if (editingLocationId === null) {
            method = "POST";
            url = "http://localhost:5000/api/locations";
        } else {
            method = "PATCH";
            url = `http://localhost:5000/api/locations/${editingLocationId}`;
        }

      const response = await fetch (
       url,
        {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(locationData)
        }
      )

      const data = await response.json();

      if (!response.ok){
        setError(data.message);
        return;
      }
setSuccess(
    editingLocationId === null
        ? "Location created successfully"
        : "Location updated successfully"
);

      await fetchLocations();
      resetForm();

      

    }



    return (
        <>

            <h1>Locations</h1>

{success && <p className="message-success">{success}</p>}

{error && <p className="message-error">{error}</p>} 



            {locations.map((location) => (
                <div key={location.id} className="data-card">
                    <p>Location Name: {location.name}</p>
                    <p>Code: {location.code}</p>
                    <p>Address: {location.address}</p>

                       <button
                        type="button"
                        onClick={() => {
                            setEditingLocationId(location.id);
                            setName(location.name);
                            setCode(location.code);
                            setAddress(location.address);  
                            setError("");
                            setSuccess("")
                        }}
                    >
                        Edit
                    </button>

                </div>
            ))}

            <form 
            className="data-card"
            onSubmit={handleCreateLocation}>

                <label>Location Name</label>
                <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                />

                <label>Location Code</label>
                <input
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                />


                <label>Address</label>
                <input
                type="text"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                />

<button type="submit">
    {editingLocationId === null
        ? "Create Location"
        : "Update Location"}
</button>

 {editingLocationId !== null && (
    <button
    type="button"
    className="button-secondary"
    onClick={resetForm}
    >cancel Edit</button>

 )}

            </form>


        </>
    )

}