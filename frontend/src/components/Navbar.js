"use client";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
    const [user, setUser] = useState(null)
    const [error, setError] = useState("")

    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

        useEffect(() => {
        const token = localStorage.getItem("token")

        if (!token){
            return;
        }

          const fetchUser =async () => {

       try {
         const response = await fetch (
            "http://localhost:5000/api/auth/me",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        const data = await response.json()

        if (!response.ok){
            setError(data.message);

            if (response.status === 401){
                localStorage.removeItem("token");
                router.push("/login")
            }
            return
        }
        setUser(data)
       } catch (error) {
        setError("Unable to connect to server")
        
       }
    
    }

    fetchUser();
    },[])

    return (
        <nav className="navbar">
            <h2 className="navbar-brand">Multi-Location Inventory</h2>

            <div className="navbar-links">
                <Link href="/dashboard" className="navbar-link">
                    Dashboard
                </Link>

                <Link href="/products" className="navbar-link">
                    Products
                </Link>

                <Link href="/locations" className="navbar-link">
                    Locations
                </Link>


                <Link href="/inventory" className="navbar-link">
                    Inventory
                </Link>


                <Link href="/stock-transfers" className="navbar-link">
                    Stock Transfers
                </Link>


                <Link href="/orders" className="navbar-link">
                    Orders
                </Link>

                {user?.role === "ADMIN" && (
                    <Link href="/users">Users</Link>
                )}


                <button onClick={handleLogout} className="navbar-logout">
                    Logout
                </button>
            </div>
        </nav>
    );
}