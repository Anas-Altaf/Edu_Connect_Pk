import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import Loader from "../ui/Loader";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, loading, authInitialized } = useContext(AuthContext);

  // Show loader while checking authentication
  if (loading || !authInitialized) {
    return <Loader size="lg" fullWidth message="Loading..." />;
  }

  // If not authenticated, redirect to home page (instead of login)
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // Check if user has required role
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
