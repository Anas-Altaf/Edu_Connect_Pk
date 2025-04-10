import React, { useState, useEffect, useContext } from "react";
import { userAPI } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import Loader from "../ui/Loader";

const StudentProfileForm = () => {
  const { currentUser, updateCurrentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    bio: "",
    profilePicture: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await userAPI.getProfile();
        if (response.data.success) {
          const userData = response.data.data;
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            location: userData.location || "",
            bio: userData.bio || "",
            profilePicture: userData.profilePicture || "",
          });
        } else {
          toast.error("Failed to load profile data");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error("An error occurred while loading your profile");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProfileData();
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const { email, ...updateData } = formData;

      const response = await userAPI.updateProfile(updateData);
      if (response.data.success) {
        toast.success("Profile updated successfully!");

        updateCurrentUser({
          ...currentUser,
          name: formData.name,
          profilePicture: formData.profilePicture,
        });
        setMessage("Profile updated successfully");
      } else {
        setError("Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(
        err.response?.data?.message ||
          "An error occurred while updating profile"
      );
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader size="md" />;
  }

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div className="form-control">
        <label htmlFor="name" className="input-label">
          Name
        </label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div className="form-control">
        <label htmlFor="location" className="input-label">
          Location
        </label>
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div className="form-control">
        <label htmlFor="bio" className="input-label">
          Bio
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="input"
        ></textarea>
      </div>
      <div className="form-control">
        <label htmlFor="profilePicture" className="input-label">
          Profile Picture URL
        </label>
        <input
          name="profilePicture"
          value={formData.profilePicture}
          onChange={handleChange}
          className="input"
        />
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
};

export default StudentProfileForm;
