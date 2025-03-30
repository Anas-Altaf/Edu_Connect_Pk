import React, { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";
import TutorDashboard from "./TutorDashboard";
import AdminDashboard from "./AdminDashboard";

const DashboardPage = () => {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  // Render the appropriate dashboard based on user role
  switch (currentUser.role) {
    case "student":
      return <StudentDashboard />;
    case "tutor":
      return <TutorDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default DashboardPage;
