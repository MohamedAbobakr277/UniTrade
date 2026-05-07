import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import SellTool from "./pages/SellTool";
import Profile from "./pages/Profile";
import ItemDetails from "./pages/ItemDetails";
import MyListings from "./pages/MyListings";
import Favourites from "./pages/Favourites";
import SellerProfile from "./pages/SellerProfile";
import Notifications from "./pages/Notifications";
import AIChatbot from "./components/AIChatbot";

const ProductFallback = () => {
  const { id } = useParams();
  return <Navigate to={`/item/${id}`} replace />;
};

export default function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admindashboard");

  return (
    <>
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected user routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sell"
        element={
          <ProtectedRoute>
            <SellTool />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-listings"
        element={
          <ProtectedRoute>
            <MyListings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/item/:id"
        element={
          <ProtectedRoute>
            <ItemDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/favourites"
        element={
          <ProtectedRoute>
            <Favourites />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/:id"
        element={
          <ProtectedRoute>
            <SellerProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admindashboard" element={<AdminDashboard />} />
      </Route>

      {/* Fallback for old notification links */}
      <Route path="/product/:id" element={<ProductFallback />} />
      <Route path="/items/:id" element={<ProductFallback />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
    {!isAdminPath && <AIChatbot />}
    </>
  );
}