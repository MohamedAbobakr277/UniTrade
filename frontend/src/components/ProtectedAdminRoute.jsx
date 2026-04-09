// src/components/ProtectedAdminRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { auth } from "../firebase";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const ProtectedAdminRoute = () => {
    const [isAdmin, setIsAdmin] = useState(null);
    const user = auth.currentUser;

    useEffect(() => {
        const checkAdmin = async () => {
            if (!user) {
                setIsAdmin(false);
                return;
            }
            // Fetch the user role from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === "admin") {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        };
        checkAdmin();
    }, [user]);

    // Show nothing (or a spinner) while checking status
    if (isAdmin === null) return null;

    // If admin, show the dashboard (Outlet), otherwise redirect
    return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedAdminRoute;