import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import { sessionAPI } from "../../services/api";
import { toast } from "react-toastify";

const StudentDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    pending: 0,
  });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Get all sessions
        const response = await sessionAPI.getStudentSessions({});
        console.log("Student sessions response:", response.data);

        if (response.data.success) {
          let sessionData = [];

          // Handle both array and object with 'sessions' property responses
          if (Array.isArray(response.data.data)) {
            sessionData = response.data.data;
          } else if (response.data.data && response.data.data.sessions) {
            sessionData = response.data.data.sessions;
          }

          setSessions(sessionData);

          // Get session stats
          const statsResponse = await sessionAPI.getSessionStats();
          console.log("Student stats response:", statsResponse.data);

          if (statsResponse.data.success) {
            setStats({
              total: sessionData.length,
              upcoming: statsResponse.data.data.upcoming || 0,
              completed: statsResponse.data.data.completed || 0,
              pending: statsResponse.data.data.pending || 0,
            });
          }
        } else {
          toast.error("Failed to load sessions");
        }
      } catch (err) {
        console.error("Error loading student sessions:", err);
        toast.error("Error loading sessions");
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "badge badge-warning";
      case "confirmed":
        return "badge badge-primary";
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
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-greeting">Welcome to Your Dashboard</h1>
        <p className="dashboard-subtitle">
          Here's an overview of your tutoring sessions
        </p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-title">Total Sessions</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Upcoming</span>
          <span className="stat-value">{stats.upcoming}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Completed</span>
          <span className="stat-value">{stats.completed}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Pending</span>
          <span className="stat-value">{stats.pending}</span>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Your Sessions</h2>
          <Link to="/sessions" className="btn btn-outline btn-sm">
            View All
          </Link>
        </div>

        {sessions.length === 0 ? (
          <EmptyState
            title="No sessions yet"
            message="Book a session with a tutor to get started"
            action={
              <Link to="/tutors" className="btn btn-primary">
                Find a Tutor
              </Link>
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
                    <span className="date">
                      {new Date(session.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="time">{session.timeSlot}</span>
                  </div>
                  <span className={getStatusClass(session.status)}>
                    {session.status.charAt(0).toUpperCase() +
                      session.status.slice(1)}
                  </span>
                </div>
                <div className="session-body">
                  <h3>{session.tutorId?.userId?.name || "Tutor"}</h3>
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
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recommended Tutors</h2>
          <Link to="/tutors" className="btn btn-outline btn-sm">
            See All
          </Link>
        </div>
        {/* This would be populated with recommended tutors */}
        <p className="text-muted">Based on your interests and past sessions</p>
      </div>
    </div>
  );
};

export default StudentDashboard;
