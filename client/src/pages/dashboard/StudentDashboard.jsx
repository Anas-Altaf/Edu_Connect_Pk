import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { sessionAPI, wishlistAPI } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";

const StudentDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [stats, setStats] = useState({
    upcoming: 0,
    pending: 0,
    completed: 0,
    canceled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const statsResponse = await sessionAPI.getSessionStats();
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }

        const sessionsResponse = await sessionAPI.getStudentSessions({
          status: "confirmed",
        });
        if (sessionsResponse.data.success) {
          const sessions = sessionsResponse.data.data || [];

          const sortedSessions = sessions
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3);
          setUpcomingSessions(sortedSessions);
        }

        try {
          const wishlistResponse = await wishlistAPI.getWishlistCount();
          if (wishlistResponse.data.success) {
            setWishlistCount(wishlistResponse.data.data.count);
          }
        } catch (err) {
          console.error("Error fetching wishlist count:", err);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        toast.error("Failed to load dashboard data");
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

  if (loading) {
    return <Loader size="lg" fullWidth />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-greeting">Hello, {currentUser.name}!</h2>
        <p className="dashboard-subtitle">
          Welcome back to your learning dashboard
        </p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-title">Upcoming Sessions</span>
          <span className="stat-value">{stats.upcoming}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Pending Requests</span>
          <span className="stat-value">{stats.pending}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Completed Sessions</span>
          <span className="stat-value">{stats.completed}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Wishlist Tutors</span>
          <span className="stat-value">{wishlistCount}</span>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Upcoming Sessions</h3>
            <Link to="/sessions" className="btn btn-sm btn-outline">
              View All
            </Link>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="empty-section">
              <p>No upcoming sessions found.</p>
              <Link to="/tutors" className="btn btn-primary btn-sm">
                Find a Tutor
              </Link>
            </div>
          ) : (
            <div className="upcoming-sessions">
              {upcomingSessions.map((session) => (
                <Link
                  to={`/sessions/${session._id}`}
                  key={session._id}
                  className="dashboard-session-card"
                >
                  <div className="session-date">
                    <span className="date-icon">📅</span>
                    <span className="date-text">
                      {formatDate(session.date)}
                    </span>
                    <span className="time-text">{session.timeSlot}</span>
                  </div>

                  <div className="session-tutor">
                    <span className="tutor-name">
                      {session.tutorId?.userId?.name || "Tutor"}
                    </span>
                    <span className="session-subject">
                      {session.subject || "General tutoring"}
                    </span>
                    <span className="session-type">
                      {session.type === "online" ? "Online" : "In-person"}{" "}
                      session
                    </span>
                  </div>

                  <div className="session-arrow">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Wishlist</h3>
            <Link to="/wishlist" className="btn btn-sm btn-outline">
              View Wishlist
            </Link>
          </div>

          {wishlistCount === 0 ? (
            <div className="empty-section">
              <p>Your wishlist is empty.</p>
              <Link to="/tutors" className="btn btn-primary btn-sm">
                Browse Tutors
              </Link>
            </div>
          ) : (
            <div className="wishlist-preview">
              <p>
                You have {wishlistCount} tutor{wishlistCount !== 1 ? "s" : ""}{" "}
                in your wishlist. Visit your wishlist to view them or book a
                session.
              </p>
              <Link to="/wishlist" className="btn btn-primary btn-sm">
                Go to Wishlist
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
