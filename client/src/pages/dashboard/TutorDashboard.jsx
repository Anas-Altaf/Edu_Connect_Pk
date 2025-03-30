import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import { sessionAPI } from "../../services/api";
import { toast } from "react-toastify";

const TutorDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [earnings, setEarnings] = useState({
    total: 0,
    weekly: 0,
    monthly: 0,
  });
  const [stats, setStats] = useState({
    upcoming: 0,
    pending: 0,
    completed: 0,
    canceled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const sessionResponse = await sessionAPI.getTutorSessions({
          status: "confirmed",
        });

        console.log("Tutor sessions response:", sessionResponse.data);

        if (sessionResponse.data.success) {
          let sessionData = [];

          if (Array.isArray(sessionResponse.data.data)) {
            sessionData = sessionResponse.data.data;
          } else if (
            sessionResponse.data.data &&
            sessionResponse.data.data.sessions
          ) {
            sessionData = sessionResponse.data.data.sessions;
          }

          setSessions(sessionData);
        } else {
          toast.error("Failed to load sessions");
        }

        const earningsResponse = await sessionAPI.getEarningsSummary();
        console.log("Earnings response:", earningsResponse.data);

        if (earningsResponse.data.success) {
          setEarnings({
            total: earningsResponse.data.data.totalEarnings || 0,
            weekly: earningsResponse.data.data.weeklyEarnings || 0,
            monthly: earningsResponse.data.data.monthlyEarnings || 0,
          });
        }

        const statsResponse = await sessionAPI.getSessionStats();
        console.log("Stats response:", statsResponse.data);

        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }
      } catch (err) {
        console.error("Error loading tutor dashboard data:", err);
        toast.error("Error loading dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "badge badge-warning";
      case "confirmed":
        return "badge badge-info";
      case "completed":
        return "badge badge-success";
      case "canceled":
        return "badge badge-danger";
      default:
        return "badge";
    }
  };

  if (loading) return <Loader size="lg" fullWidth />;

  return (
    <div className="tutor-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-greeting">Welcome to Your Dashboard</h1>
        <p className="dashboard-subtitle">
          Here's an overview of your tutoring activity
        </p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-title">Total Earnings</span>
          <span className="stat-value">Rs. {earnings.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Monthly Earnings</span>
          <span className="stat-value">Rs. {earnings.monthly}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Upcoming Sessions</span>
          <span className="stat-value">{stats.upcoming}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Pending Requests</span>
          <span className="stat-value">{stats.pending}</span>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Upcoming Sessions</h2>
          <Link to="/sessions" className="btn btn-outline btn-sm">
            View All
          </Link>
        </div>

        {sessions.length === 0 ? (
          <EmptyState
            title="No upcoming sessions"
            message="You don't have any upcoming tutoring sessions"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            }
          />
        ) : (
          <div className="sessions-grid">
            {sessions.slice(0, 3).map((session) => (
              <Link
                key={session._id}
                to={`/sessions/${session._id}`}
                className={`session-card session-${session.status}`}
              >
                <div className="session-header">
                  <div className="session-date">
                    <span className="date">{formatDate(session.date)}</span>
                    <span className="time">{session.timeSlot}</span>
                  </div>
                  <span className={getStatusBadgeClass(session.status)}>
                    {session.status.charAt(0).toUpperCase() +
                      session.status.slice(1)}
                  </span>
                </div>
                <div className="session-body">
                  <h3>{session.studentId?.name || "Student"}</h3>
                  <div className="session-subject">
                    {session.subject || "General tutoring session"}
                  </div>
                  <div className="session-type">
                    <i
                      className={
                        session.type === "online"
                          ? "icon-online"
                          : "icon-in-person"
                      }
                    ></i>
                    <span>
                      {session.type === "online"
                        ? "Online Session"
                        : "In-person Session"}
                    </span>
                  </div>
                </div>
                <div className="session-footer">
                  <div className="session-price">Rs. {session.amount}</div>
                  <div className="session-action">
                    <span className="view-details">View Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorDashboard;
