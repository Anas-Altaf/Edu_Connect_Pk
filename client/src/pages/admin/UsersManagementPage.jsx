import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userAPI } from "../../services/api";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";

const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentLimit] = useState(10);

  // Fetch users with filters
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: currentLimit,
        };

        if (searchTerm) params.search = searchTerm;
        if (roleFilter !== "all") params.role = roleFilter;
        if (statusFilter !== "all") params.status = statusFilter;

        console.log("Fetching users with params:", params);
        const response = await userAPI.getAllUsers(params);
        console.log("Users API response:", response.data);

        if (response.data.success) {
          // Handle different response structures
          let userData = [];
          if (Array.isArray(response.data.data)) {
            userData = response.data.data;
          } else if (
            response.data.data &&
            Array.isArray(response.data.data.users)
          ) {
            userData = response.data.data.users;
          } else if (response.data.users) {
            userData = response.data.users;
          }

          setUsers(userData);

          // Get pagination info
          setTotalPages(
            response.data.totalPages || response.data.data?.totalPages || 1
          );
        } else {
          toast.error("Error loading users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, searchTerm, roleFilter, statusFilter, currentLimit]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await userAPI.updateUserStatus(userId, newStatus);
      if (response.data.success) {
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, status: newStatus } : user
          )
        );
        toast.success("User status updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update user status");
      console.error("Error updating user status:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        const response = await userAPI.deleteUser(userId);
        if (response.data.success) {
          setUsers(users.filter((user) => user._id !== userId));
          toast.success("User deleted successfully");
        }
      } catch (error) {
        toast.error("Failed to delete user");
        console.error("Error deleting user:", error);
      }
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "student":
        return "badge badge-info";
      case "tutor":
        return "badge badge-success";
      case "admin":
        return "badge badge-warning";
      default:
        return "badge";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "badge badge-success";
      case "inactive":
        return "badge badge-danger";
      case "pending":
        return "badge badge-warning";
      default:
        return "badge";
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Users Management</h1>
        <p className="admin-description">
          View and manage all users on the platform
        </p>
      </div>

      <div className="users-filters">
        <form onSubmit={handleSearch} className="search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>

        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="role-filter">Role:</label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="tutor">Tutors</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader size="lg" fullWidth />
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-name-cell">
                        <div className="avatar avatar-sm">
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.name} />
                          ) : (
                            <div className="avatar-placeholder">
                              {user.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                          )}
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={getRoleBadgeClass(user.role)}>
                        {user.role?.charAt(0).toUpperCase() +
                          user.role?.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(user.status)}>
                        {user.status?.charAt(0).toUpperCase() +
                          user.status?.slice(1)}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/admin/users/${user._id}`}
                          className="btn btn-sm btn-outline"
                        >
                          View
                        </Link>
                        <div className="dropdown">
                          <button className="btn btn-sm btn-outline dropdown-toggle">
                            Status
                          </button>
                          <div className="dropdown-menu">
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleStatusChange(user._id, "active")
                              }
                              disabled={user.status === "active"}
                            >
                              Activate
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleStatusChange(user._id, "inactive")
                              }
                              disabled={user.status === "inactive"}
                            >
                              Deactivate
                            </button>
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="empty-state">
              <p>No users found matching your filters.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-prev"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="pagination-next"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UsersManagementPage;
