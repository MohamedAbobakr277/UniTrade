import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useState, useEffect } from "react";

export default function ProtectedRoute({ children }) {
    const auth = getAuth();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [banned, setBanned] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists() && userDoc.data().isBanned) {
                        await signOut(auth);
                        setBanned(true);
                        setUser(null);
                        setLoading(false);
                        return;
                    }
                } catch (err) {
                    console.error("Error checking ban status:", err);
                }
            }
            setUser(currentUser);
            setBanned(false);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);


    if (loading) {
        return <div>Loading...</div>;
    }

    if (banned) {
        return <Navigate to="/login" replace state={{ banned: true }} />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }


    return children;
}