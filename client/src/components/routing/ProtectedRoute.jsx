import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

export default ProtectedRoute;
