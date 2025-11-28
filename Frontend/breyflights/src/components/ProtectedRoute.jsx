import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading} = useAuth();
  const location = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('payment_intent');
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  // 1. User not load (null)
  if (loading) {
    return <div>Loading...</div>;
  }

  // 2. Authenticated user try to access to login or register
  if (
    (location.pathname.startsWith("/login") ||
     location.pathname.startsWith("/register")) &&
    user
  ) {
    return <Navigate to="/" replace />;
  }

  // 3. Not authenticated user try to access to login or register
  if (!user && !location.pathname.startsWith("/login") && !location.pathname.startsWith("/register")) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if ((!user || !id) &&location.pathname.startsWith("/success") ){
    return <Navigate to="/" replace />;
  }
  if ((!user || !id) && location.pathname.startsWith("/payment") && cart.length === 0){
    return <Navigate to="/" replace />;
  }

  // 4. User with no admin privileges
  if (location.pathname.startsWith("/admin") && user?.rol !== "Admin") {
    return <Navigate to="/profile" replace />;
  }

  // 5. All ok
  return children;
}
