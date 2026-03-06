import { Navigate, Outlet } from "react-router-dom";
import { getAuth } from "firebase/auth";

const ProtectedAdminRoute = () => {
    const { user, loading } = getAuth();

    if (loading) return <div>Loading...</div>;

    return user && user.isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedAdminRoute;