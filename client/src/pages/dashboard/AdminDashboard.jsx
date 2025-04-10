import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userAPI } from "../../services/api";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";
import { AuthContext } from "../../contexts/AuthContext";

const AdminDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: {
      total: 0,
      students: 0,
      tutors: 0,
      admins: 0,
      active: 0,
      inactive: 0,
    },
    sessions: { total: 0, pending: 0, completed: 0, cancelled: 0 },
    verifications: { pending: 0, approved: 0, rejected: 0 },
    recentUsers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AdminDashboard - Current user:", currentUser);
    if (!currentUser) {
      console.log("No user found, waiting for auth...");
      return;
    }

    if (currentUser.role !== "admin") {
      console.log("User is not an admin, redirecting to unauthorized");
      navigate("/unauthorized");
      return;
    }

    console.log("User is an admin, proceeding with dashboard");

    // Test admin access first
    const testAdminAccess = async () => {
      try {
        console.log("Testing admin access...");
        const testResponse = await userAPI.testAdminAccess();
        console.log("Admin access test response:", testResponse.data);
        return true;
      } catch (err) {
        console.error("Admin access test failed:", err);
        console.log("Error details:", err.response?.data || err.message);
        toast.error(
          "Admin access test failed: " +
            (err.response?.data?.message || err.message)
        );
        return false;
      }
    };

    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        // Fetch all dashboard stats in one call
        console.log("Fetching dashboard stats...");
        const response = await userAPI.getDashboardStats();
        console.log("Dashboard stats response:", response.data);

        if (response.data.success) {
          const dashboardData = response.data.data;

          setStats({
            users: dashboardData.users || {
              total: 0,
              students: 0,
              tutors: 0,
              admins: 0,
              active: 0,
              inactive: 0,
            },
            verifications: dashboardData.verifications || {
              pending: 0,
              approved: 0,
              rejected: 0,
            },
            sessions: dashboardData.sessions || {
              total: 0,
              pending: 0,
              completed: 0,
              cancelled: 0,
            },
            recentUsers: dashboardData.recentUsers || [],
          });
        } else {
          toast.error("Failed to load dashboard statistics");
        }
      } catch (err) {
        console.error("Error fetching admin dashboard stats:", err);
        console.log("Error details:", err.response?.data || err.message);
        toast.error(
          "Failed to load dashboard statistics: " +
            (err.response?.data?.message || err.message)
        );

        // Set default stats to avoid UI errors
        setStats({
          users: {
            total: 0,
            students: 0,
            tutors: 0,
            admins: 0,
            active: 0,
            inactive: 0,
          },
          verifications: {
            pending: 0,
            approved: 0,
            rejected: 0,
          },
          sessions: {
            total: 0,
            pending: 0,
            completed: 0,
            cancelled: 0,
          },
          recentUsers: [],
        });
      } finally {
        setLoading(false);
      }
    };

    const initDashboard = async () => {
      if (currentUser && currentUser.role === "admin") {
        const accessGranted = await testAdminAccess();
        if (accessGranted) {
          fetchDashboardStats();
        } else {
          setLoading(false);
          toast.error(
            "Could not access admin dashboard. Please try logging in again."
          );
        }
      }
    };

    initDashboard();
  }, [currentUser, navigate]);

  if (loading) {
    return <Loader size="lg" fullWidth />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-greeting">Admin Dashboard</h2>
        <p className="dashboard-subtitle">
          Overview of platform statistics and management tasks
        </p>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h3 className="section-title">Users Overview</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-title">Total Users</span>
              <span className="stat-value">{stats.users.total}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Students</span>
              <span className="stat-value">{stats.users.students}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Tutors</span>
              <span className="stat-value">{stats.users.tutors}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Admins</span>
              <span className="stat-value">{stats.users.admins}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Active Users</span>
              <span className="stat-value">{stats.users.active}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Inactive Users</span>
              <span className="stat-value">{stats.users.inactive}</span>
            </div>
          </div>
          <div className="section-actions">
            <Link to="/admin/users" className="btn btn-primary">
              Manage Users
            </Link>
            <Link to="/admin/users/create" className="btn btn-outline">
              Create User
            </Link>
          </div>
        </div>

        <div className="dashboard-section">
          <h3 className="section-title">Verifications</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-title">Pending Verifications</span>
              <span className="stat-value">{stats.verifications.pending}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Approved Verifications</span>
              <span className="stat-value">{stats.verifications.approved}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Rejected Verifications</span>
              <span className="stat-value">{stats.verifications.rejected}</span>
            </div>
          </div>
          <div className="section-actions">
            <Link to="/admin/verifications" className="btn btn-primary">
              Review Verifications
            </Link>
          </div>
        </div>

        <div className="dashboard-section">
          <h3 className="section-title">Sessions Analytics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-title">Total Sessions</span>
              <span className="stat-value">{stats.sessions.total}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Pending Sessions</span>
              <span className="stat-value">{stats.sessions.pending}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Completed Sessions</span>
              <span className="stat-value">{stats.sessions.completed}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Cancelled Sessions</span>
              <span className="stat-value">{stats.sessions.cancelled}</span>
            </div>
          </div>
          <div className="section-actions">
            <Link to="/admin/reports" className="btn btn-primary">
              View Reports
            </Link>
            <Link to="/admin/sessions" className="btn btn-outline">
              Manage Sessions
            </Link>
          </div>
        </div>

        <div className="dashboard-section">
          <h3 className="section-title">Recent Users</h3>
          {stats.recentUsers.length > 0 ? (
            <div className="recent-users-list">
              {stats.recentUsers.map((user) => (
                <div key={user._id} className="recent-user-card">
                  <div className="user-avatar">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <h4 className="user-name">{user.name}</h4>
                    <p className="user-email">{user.email}</p>
                    <div className="user-meta">
                      <span
                        className={`badge ${
                          user.role === "admin"
                            ? "badge-warning"
                            : user.role === "tutor"
                            ? "badge-success"
                            : "badge-info"
                        }`}
                      >
                        {user.role?.charAt(0).toUpperCase() +
                          user.role?.slice(1)}
                      </span>
                      <span className="user-date">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="user-actions">
                    <Link
                      to={`/admin/users/${user._id}`}
                      className="btn btn-sm btn-outline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No recent users found.</p>
            </div>
          )}
          <div className="section-actions">
            <Link to="/admin/users" className="btn btn-primary">
              View All Users
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
