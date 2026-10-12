"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {

    const router = useRouter();

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const loginData = {
            email: email,
            password: password
        }

        const response = await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            }
        )
        const data = await response.json();

        if (!response.ok) {
            setError(data.message);
            return;
        }

        // This stores the JWT in the browser
        localStorage.setItem("token", data.token);
        router.push("/dashboard");

        console.log(response.ok);
        console.log(data);
    };
    return (
        <>
          <main  className="auth-page">
              <h1>Login</h1>
            <form className="auth-card" onSubmit={handleSubmit}>


                <label>Email</label>
                <input type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />


                <label>Password</label>
                <input type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                ></input>
                {error && <p className="message-error">{error}</p>}
                <button>Login</button>

            </form>

          </main>
        </>
    )
}
