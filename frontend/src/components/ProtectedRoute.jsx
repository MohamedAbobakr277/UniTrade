import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

export default function ProtectedRoute({ children }) {
    const auth = getAuth();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);


    if (loading) {
        return <div>Loading...</div>;
    }


    if (!user) {
        return <Navigate to="/login" replace />;
    }


    return children;
}