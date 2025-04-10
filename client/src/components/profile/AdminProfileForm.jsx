import React, { useState, useEffect, useContext } from "react";
import { userAPI } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import Loader from "../ui/Loader";

const AdminProfileForm = () => {
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
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(
        err.response?.data?.message ||
          "An error occurred while updating profile"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader size="md" />;
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3 className="form-section-title">Admin Information</h3>

        <div className="form-control">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="input"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-control">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            className="input"
            value={formData.email}
            disabled
            title="Email cannot be changed"
          />
          <small className="input-helper">
            Email address cannot be changed
          </small>
        </div>

        <div className="form-control">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            className="input"
            value={formData.location}
            onChange={handleChange}
            placeholder="Your location"
          />
        </div>

        <div className="form-control">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            className="input"
            rows="4"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Brief description about yourself"
          ></textarea>
        </div>

        <div className="form-control">
          <label htmlFor="profilePicture">Profile Picture URL</label>
          <input
            type="url"
            id="profilePicture"
            name="profilePicture"
            className="input"
            value={formData.profilePicture}
            onChange={handleChange}
            placeholder="URL to your profile picture"
          />
        </div>

        {formData.profilePicture && (
          <div className="profile-image-preview">
            <img
              src={formData.profilePicture}
              alt="Profile Preview"
              className="preview-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/150?text=Invalid+Image";
              }}
            />
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </form>
  );
};

export default AdminProfileForm;
