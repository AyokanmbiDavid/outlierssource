
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="auth-loader">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/sign" replace />;
  }

  return <Outlet />;
}
