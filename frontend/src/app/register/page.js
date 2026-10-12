"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function Register() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [locationId, setLocationId] = useState("");
    const [error, setError] = useState("");
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const fetchLocations = async () => {
            const response = await fetch(
                "http://localhost:5000/api/locations"

            )

            const data = await response.json();

            setLocations(data);
        }
        fetchLocations();

    }, [])

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const registerData = {
            name,
            email,
            password,
            locationId: Number(locationId)
        };
        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(registerData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message);
                return;
            }

            router.push("/login");


        } catch (error) {
            setError("Unable to connect to the server");

        } finally {
            setLoading(false)
        }

    };

    return (
        <>
            <main className="auth-page">
                <h1>Register</h1>

                <form className="auth-card" onSubmit={handleSubmit}>

                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />

                    {/* <label>Location ID</label>
                <input
                    type="number"
                    value={locationId}
                    onChange={(event) => setLocationId(event.target.value)}
                /> */}

                    <h1>Select Location</h1>

                    <select
                        value={locationId}
                        onChange={(event) => setLocationId(event.target.value)}
                        required
                    >
                        <option value="">Select a location</option>

                        {locations.map((location) => (
                            <option
                                key={location.id}
                                value={location.id}
                            >
                                {location.name}
                            </option>
                        ))}
                    </select>




                    {error && <p className="message-error">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
            </main>
        </>
    );
}