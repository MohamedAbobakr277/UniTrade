import { Navigate, Outlet } from "react-router-dom";
import { auth, db } from "../firebase";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Box, CircularProgress } from "@mui/material";

const ProtectedAdminRoute = () => {
    const [isAdmin, setIsAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                // Fetch the user role from Firestore
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists() && userDoc.data().role === "admin") {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Error verifying admin role:", error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
                <CircularProgress size={50} sx={{ color: '#2563eb' }} />
            </Box>
        );
    }

    return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedAdminRoute;