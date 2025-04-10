import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import Loader from "../ui/Loader";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, loading, authInitialized } = useContext(AuthContext);

  if (loading || !authInitialized) {
    return <Loader size="lg" fullWidth message="Loading..." />;
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
