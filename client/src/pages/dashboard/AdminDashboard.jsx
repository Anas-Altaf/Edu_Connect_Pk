import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userAPI, verificationAPI, reportAPI } from "../../services/api";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";
import { AuthContext } from "../../contexts/AuthContext";

const AdminDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: { total: 0, students: 0, tutors: 0, admins: 0 },
    sessions: { total: 0, pending: 0, completed: 0 },
    verifications: { pending: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      navigate("/unauthorized");
      return;
    }

    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const usersResponse = await userAPI.getAllUsers({
          limit: 1,
          includeStats: true,
        });

        console.log("Users response:", usersResponse.data);

        let verificationStats = { pendingCount: 0 };
        try {
          const verificationResponse = await verificationAPI.getStats();
          if (verificationResponse.data.success) {
            verificationStats = verificationResponse.data.data || {
              pendingCount: 0,
            };
          }
        } catch (verificationError) {
          console.error(
            "Error fetching verification stats:",
            verificationError
          );
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const endDate = new Date();

        let sessionStats = { summary: { total: 0, pending: 0, completed: 0 } };
        try {
          const sessionsStatsResponse = await reportAPI.getSessionsReport(
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0]
          );

          if (sessionsStatsResponse.data.success) {
            sessionStats = sessionsStatsResponse.data.data || sessionStats;
          }
        } catch (sessionError) {
          console.error("Error fetching session stats:", sessionError);
        }

        const userStats = {
          total:
            usersResponse.data.stats?.total || usersResponse.data.total || 0,
          students: usersResponse.data.stats?.students || 0,
          tutors: usersResponse.data.stats?.tutors || 0,
          admins: usersResponse.data.stats?.admins || 0,
        };

        setStats({
          users: userStats,
          verifications: {
            pending: verificationStats.pendingCount || 0,
          },
          sessions: sessionStats.summary || {
            total: 0,
            pending: 0,
            completed: 0,
          },
        });
      } catch (err) {
        console.error("Error fetching admin dashboard stats:", err);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && currentUser.role === "admin") {
      fetchDashboardStats();
    }
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
          </div>
          <div className="section-actions">
            <Link to="/admin/users" className="btn btn-primary">
              Manage Users
            </Link>
          </div>
        </div>

        <div className="dashboard-section">
          <h3 className="section-title">Verifications</h3>
          <div className="verification-summary">
            <div className="stat-card">
              <span className="stat-title">Pending Verification Requests</span>
              <span className="stat-value">{stats.verifications.pending}</span>
            </div>
          </div>
          <div className="section-actions">
            <Link to="/admin/verifications" className="btn btn-primary">
              Review Verifications
            </Link>
          </div>
        </div>

        <div className="dashboard-section">
          <h3 className="section-title">Platform Analytics</h3>
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
          </div>
          <div className="section-actions">
            <Link to="/admin/reports" className="btn btn-primary">
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
