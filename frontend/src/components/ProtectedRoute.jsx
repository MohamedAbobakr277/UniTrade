import { Navigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

export default function ProtectedRoute({ children }) {
    const auth = getAuth();
    const user = auth.currentUser;

    // If no logged-in user → redirect to login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // If user exists → show the page
    return children;
}