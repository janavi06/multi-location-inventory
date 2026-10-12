"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {

    const router = useRouter();

    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchUser = async () => {

            const token = localStorage.getItem("token")

            if (!token){
                router.push("/login");
                return;
            }
            const response = await fetch(

                "http://localhost:5000/api/auth/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }

            )

            const data = await response.json();

                if (!response.ok) {

                    if (response.status === 401){
                        localStorage.removeItem("token")
                        router.push("/login")
                        return
                    }
                setError(data.message);
                return;
            }

            setUser(data);
        }
        fetchUser();
    }, [])


 return (
    <>
        {error
            ? <p>{error}</p>
            : user === null
                ? <h1>User Loading...</h1>
                : <div>
                    <h1>Dashboard</h1>
                    <p>Welcome, {user.name}</p>
                    <p>Email: {user.email}</p>
                    <p>Role: {user.role}</p>
                </div>
        }
    </>
);
}