import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const RedirectIfAuthenticated = ({ children }) => {
  const { user, staff, loading } = useAuth();

  if (loading) return null;

  if (user) return <Navigate to="/User/Dashboard/" replace />;
  if (staff) return <Navigate to="/Staff/Dashboard/" replace />;

  return children;
};

export default RedirectIfAuthenticated;
