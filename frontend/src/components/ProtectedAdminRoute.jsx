// src/components/ProtectedAdminRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { getAuth } from "firebase/auth";

const ProtectedAdminRoute = () => {
    const auth = getAuth();

    // لو مفيش user مسجل دخول، نرجع لل login
    if (!auth.currentUser) return <Navigate to="/login" replace />;

    // لو موجود user، نسمح له بالدخول على الـ Outlet
    return <Outlet />;
};

export default ProtectedAdminRoute;