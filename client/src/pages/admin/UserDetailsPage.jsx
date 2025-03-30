import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userAPI, tutorAPI } from "../../services/api";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tutorProfile, setTutorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const response = await userAPI.getUserById(id);
        if (response.data.success) {
          const userData = response.data.data;
          setUser(userData);
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            role: userData.role || "",
            status: userData.status || "active",
          });

          if (userData.role === "tutor") {
            try {
              const tutorResponse = await tutorAPI.getTutorByUserId(
                userData._id
              );
              if (tutorResponse.data.success) {
                setTutorProfile(tutorResponse.data.data);
              }
            } catch (error) {
              console.error("Error fetching tutor profile:", error);
            }
          }
        } else {
          toast.error("User not found");
          navigate("/admin/users");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to load user details");
        navigate("/admin/users");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userAPI.updateUser(id, formData);
      if (response.data.success) {
        setUser({
          ...user,
          ...formData,
        });
        toast.success("User updated successfully");
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await userAPI.updateUserStatus(id, newStatus);
      if (response.data.success) {
        setUser({
          ...user,
          status: newStatus,
        });
        setFormData({
          ...formData,
          status: newStatus,
        });
        toast.success("User status updated successfully");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        const response = await userAPI.deleteUser(id);
        if (response.data.success) {
          toast.success("User deleted successfully");
          navigate("/admin/users");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  if (loading) {
    return <Loader size="lg" fullWidth />;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">User Details</h1>
        <div className="admin-actions">
          <button
            className="btn btn-outline"
            onClick={() => navigate("/admin/users")}
          >
            Back to Users
          </button>
          {!editMode ? (
            <button
              className="btn btn-primary"
              onClick={() => setEditMode(true)}
            >
              Edit User
            </button>
          ) : (
            <button
              className="btn btn-danger"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="user-details-container">
        <div className="user-profile-card">
          <div className="user-profile-header">
            <div className="user-avatar">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">
                  {user?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className="user-info">
              <h2>{user?.name}</h2>
              <p className="user-email">{user?.email}</p>
              <div className="user-badges">
                <span
                  className={`badge ${
                    user?.role === "admin"
                      ? "badge-warning"
                      : user?.role === "tutor"
                      ? "badge-success"
                      : "badge-info"
                  }`}
                >
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
                <span
                  className={`badge ${
                    user?.status === "active"
                      ? "badge-success"
                      : user?.status === "pending"
                      ? "badge-warning"
                      : "badge-danger"
                  }`}
                >
                  {user?.status?.charAt(0).toUpperCase() +
                    user?.status?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {!editMode ? (
            <div className="user-details">
              <div className="detail-group">
                <h3>Account Information</h3>
                <div className="detail-row">
                  <span className="detail-label">User ID</span>
                  <span className="detail-value">{user?._id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created</span>
                  <span className="detail-value">
                    {new Date(user?.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Updated</span>
                  <span className="detail-value">
                    {new Date(user?.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {user?.role === "tutor" && tutorProfile && (
                <div className="detail-group">
                  <h3>Tutor Profile</h3>
                  <div className="detail-row">
                    <span className="detail-label">Subjects</span>
                    <span className="detail-value">
                      {tutorProfile.subjects?.join(", ") || "Not specified"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Hourly Rate</span>
                    <span className="detail-value">
                      Rs. {tutorProfile.hourlyRate || "Not specified"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Average Rating</span>
                    <span className="detail-value">
                      {tutorProfile.averageRating || "Not rated yet"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Bio</span>
                    <span className="detail-value">
                      {tutorProfile.bio || "No bio provided"}
                    </span>
                  </div>
                  <div className="detail-actions">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => navigate(`/tutors/${tutorProfile._id}`)}
                    >
                      View Full Tutor Profile
                    </button>
                  </div>
                </div>
              )}

              <div className="user-actions">
                <h3>User Actions</h3>
                <div className="action-buttons">
                  {user?.status === "active" ? (
                    <button
                      className="btn btn-warning"
                      onClick={() => handleStatusChange("inactive")}
                    >
                      Deactivate User
                    </button>
                  ) : (
                    <button
                      className="btn btn-success"
                      onClick={() => handleStatusChange("active")}
                    >
                      Activate User
                    </button>
                  )}
                  <button className="btn btn-danger" onClick={handleDeleteUser}>
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="user-edit-form">
              <form onSubmit={handleSubmit}>
                <div className="form-control">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div className="form-control">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div className="form-control">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="student">Student</option>
                    <option value="tutor">Tutor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="form-control">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
