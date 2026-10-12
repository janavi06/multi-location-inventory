import Navbar from "@/components/Navbar";

export default function Layout({ children }) {
    return (
        <>
            <Navbar />

            <main className="app-content">
                {children}
            </main>
        </>
    );
}