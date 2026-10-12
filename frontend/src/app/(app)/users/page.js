"use client";

import { useState, useEffect } from "react";

export default function () {


    const [users, setUsers] = useState([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [editingUserId, setEditingUserId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editRole, setEditRole] = useState("");
    const [editLocationId, setEditLocationId] = useState("");
    const [editIsActive, setEditIsActive] = useState(true);
    const [submitting, setSubmitting] = useState(true)
    const [success, setSuccess] = useState("");
    const [locations, setLocations] = useState([]);

    const fetchUsers = async () => {
        setError("")
        setLoading(true);

        try {
            const token = localStorage.getItem("token")

            const response = await fetch(
                "http://localhost:5000/api/users",
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

            setUsers(data);

        } catch (error) {
            setError("Unable to connect to server")

        } finally {
            setLoading(false);
        }
    }

    const handleEditUser = (user) => {
        setEditingUserId(user.id);
        setEditName(user.name);
        setEditRole(user.role);
        setEditLocationId(user.location_id ?? "");
        setEditIsActive(user.is_active);
    };

    useEffect(() => {
        fetchUsers();
    }, [])

    const handleUpdateUser = async (event) => {
        event.preventDefault();
        setError("")

        const userData = {
            name: editName,
            role: editRole,
            locationId: editLocationId === ""
                ? null
                : Number(editLocationId),
            isActive: editIsActive
        };

        setSubmitting(true);

        try {
            const token = localStorage.getItem("token")

            const response = await fetch(
                `http://localhost:5000/api/users/${editingUserId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(userData)

                }
            )

            const data = await response.json();

            if (!response.ok) {
                setError(data.message);
                return;
            }
            setSuccess("User updated successfully.");
            setEditingUserId(null);
            await fetchUsers();

        } catch (error) {
            setError("Unable to connect to server")

        } finally {
            setSubmitting(false)
        }

    }

    const handleCancelEdit = () => {
        setError("");

        setEditingUserId(null);
        setEditName("");
        setEditRole("");
        setEditLocationId("");
        setEditIsActive(true);
    };

    const fetchLocations = async() => {

     try {
        const token = localStorage.getItem("token");
           const response = await fetch (
            "http://localhost:5000/api/locations",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        const data = await response.json();

        if (!response.ok){
            setError(data.message)
            return
        }

        setLocations(data);
     } catch (error) {
        setError("Unable to connect to server")
        
     }
    }

    
    useEffect(() => {
        fetchUsers();
        fetchLocations();
    }, [])



return (
    <>
        {success && <p className="message-success">{success}</p>}


        <h1>User Management</h1>

        {loading ? (
            <p>Loading users...</p>
        ) : error ? (
            <p className="message-error">{error}</p>
        ) : users.length === 0 ? (
            <p>No users found.</p>
        ) : (
            users.map((user) => {
                const location = locations.find(
                    (location) =>
                        Number(location.id) === Number(user.location_id)
                );

                return (
                    <div key={user.id} className="data-card">
                        <p>Name: {user.name}</p>
                        <p>Email: {user.email}</p>
                        <p>Role: {user.role}</p>

                        <p>
                            Location:{" "}
                            {user.location_id == null
                                ? "All locations"
                                : location
                                    ? location.name
                                    : "Unknown location"}
                        </p>

                        <p>
                            Account Status:{" "}
                            {user.is_active ? "Active" : "Inactive"}
                        </p>

                        <button
                            type="button"
                            onClick={() => handleEditUser(user)}
                        >
                            Edit
                        </button>
                    </div>
                );
            })
        )}

        {editingUserId !== null && (
            <form className="data-card" onSubmit={handleUpdateUser}>
                <h2>Edit User</h2>

                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        value={editName}
                        onChange={(event) =>
                            setEditName(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>Role</label>
                    <select
                        value={editRole}
                        onChange={(event) =>
                            setEditRole(event.target.value)
                        }
                        required
                    >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="STAFF">STAFF</option>
                    </select>
                </div>

                <div>
                    <label>Location</label>
                    <select
                        value={editLocationId}
                        onChange={(event) =>
                            setEditLocationId(event.target.value)
                        }
                        required={editRole !== "ADMIN"}
                    >
                        <option value="">No location (Admin only)</option>

                        {locations.map((location) => (
                            <option
                                key={location.id}
                                value={location.id}
                            >
                                {location.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={editIsActive}
                            onChange={(event) =>
                                setEditIsActive(event.target.checked)
                            }
                        />
                        Active
                    </label>
                </div>

                <button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Changes"}
                </button>

                <button
                    type="button"
                    className="button-secondary"
                    onClick={handleCancelEdit}
                >
                    Cancel
                </button>
            </form>
        )}
    </>
);
}