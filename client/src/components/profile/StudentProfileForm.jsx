import React, { useState, useEffect, useContext } from "react";
import { userAPI } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";

const StudentProfileForm = () => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    bio: "",
    profilePicture: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        location: currentUser.location || "",
        bio: currentUser.bio || "",
        profilePicture: currentUser.profilePicture || "",
      });
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
      const response = await userAPI.updateProfile(formData);
      if (response.data.success) {
        setCurrentUser(response.data.data);
        setMessage("Profile updated successfully");
      } else {
        setError("Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
