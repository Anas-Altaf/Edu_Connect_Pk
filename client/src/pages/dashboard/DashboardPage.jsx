import React, { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import StudentDashboard from "./StudentDashboard";
import TutorDashboard from "./TutorDashboard";
import AdminDashboard from "./AdminDashboard";
import Loader from "../../components/ui/Loader";

const DashboardPage = () => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <Loader size="lg" fullWidth />;
  }

  const renderDashboardByRole = () => {
    switch (currentUser?.role) {
      case "student":
        return <StudentDashboard />;
      case "tutor":
        return <TutorDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return (
          <div className="error-container">
            <div className="alert alert-danger">
              There was an error loading your dashboard. Please try again.
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">{renderDashboardByRole()}</div>
    </div>
  );
};

export default DashboardPage;
