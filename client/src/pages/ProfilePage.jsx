import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import Loader from "../components/ui/Loader";
import StudentProfileForm from "../components/profile/StudentProfileForm";
import TutorProfileForm from "../components/profile/TutorProfileForm";
import AdminProfileForm from "../components/profile/AdminProfileForm";

const ProfilePage = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <Loader size="lg" fullWidth />;
  }

  if (!currentUser) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">
          Please log in to view your profile
        </div>
      </div>
    );
  }

  const renderProfileFormByRole = () => {
    switch (currentUser.role) {
      case "student":
        return <StudentProfileForm />;
      case "tutor":
        return <TutorProfileForm />;
      case "admin":
        return <AdminProfileForm />;
      default:
        return (
          <div className="error-container">
            <div className="alert alert-danger">
              Invalid user role. Please contact support.
            </div>
          </div>
        );
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="page-title">Your Profile</h1>
        <div className="profile-container">{renderProfileFormByRole()}</div>
      </div>
    </div>
  );
};

export default ProfilePage;
