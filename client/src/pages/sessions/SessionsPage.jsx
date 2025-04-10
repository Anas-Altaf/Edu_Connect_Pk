import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { sessionAPI } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Calendar from "../../components/sessions/Calendar";
import { toast } from "react-toastify";

const SessionsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("all");
  const [sessions, setSessions] = useState([]);
  const [calendarSessions, setCalendarSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [view, setView] = useState("list");
  const [stats, setStats] = useState({
    upcoming: 0,
    pending: 0,
    completed: 0,
    canceled: 0,
  });

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const filters = {};
        if (activeTab !== "all") {
          filters.status = activeTab;
        }

        // console.log("Fetching sessions with filters:", filters);
        // console.log("Current user role:", currentUser.role);

        const apiCall =
          currentUser.role === "tutor"
            ? sessionAPI.getTutorSessions(filters)
            : sessionAPI.getStudentSessions(filters);

        console.log(
          "API endpoint being called:",
          currentUser.role === "tutor"
            ? "getTutorSessions"
            : "getStudentSessions"
        );

        const response = await apiCall;
        console.log("Sessions response:", response.data);

        if (response.data.success) {
          let sessionData = [];

          if (Array.isArray(response.data.data)) {
            sessionData = response.data.data;
          } else if (
            response.data.data &&
            Array.isArray(response.data.data.sessions)
          ) {
            sessionData = response.data.data.sessions;
          } else if (response.data.data) {
            // console.log(
            //   "Possible object response detected:",
            //   response.data.data
            // );
            sessionData = [response.data.data];
          } else {
            console.log("No sessions data found in response");
            sessionData = [];
          }

          console.log("Final sessions data:", sessionData);
          setSessions(sessionData);
        } else {
          console.error("API returned success: false", response.data);
          toast.error(
            "Failed to load sessions: " +
              (response.data.message || "Unknown error")
          );
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
        console.error("Error details:", err.response?.data || err.message);
        toast.error(`An error occurred while loading sessions: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [activeTab, currentUser.role]);

  useEffect(() => {
    const fetchCalendarSessions = async () => {
      if (view !== "calendar") return;

      setCalendarLoading(true);
      try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);

        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 21);

        const response = await sessionAPI.getCalendarSessions(
          startDate.toISOString(),
          endDate.toISOString()
        );

        if (response.data.success) {
          const calendarEvents = response.data.data.map((session) => ({
            id: session._id,
            title:
              currentUser.role === "tutor"
                ? `Session with ${session.studentId?.name || "Student"}`
                : `Session with ${session.tutorId?.userId?.name || "Tutor"}`,
            start: new Date(
              session.date + "T" + session.timeSlot.split("-")[0]
            ),
            end: new Date(session.date + "T" + session.timeSlot.split("-")[1]),
            status: session.status,
          }));
          setCalendarSessions(calendarEvents);
        } else {
          toast.error("Failed to load calendar sessions");
        }
      } catch (err) {
        console.error("Error fetching calendar sessions:", err);
        toast.error("An error occurred while loading calendar");
      } finally {
        setCalendarLoading(false);
      }
    };

    fetchCalendarSessions();
  }, [view, currentUser.role]);

  useEffect(() => {
    const fetchSessionStats = async () => {
      try {
        const response = await sessionAPI.getSessionStats();
        console.log("Stats response:", response.data);

        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching session stats:", err);
      }
    };

    fetchSessionStats();
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

  return (
    <div className="sessions-page">
      <div className="page-header">
        <h1 className="page-title">My Sessions</h1>
      </div>

      {/* Stats Cards */}
      <div className="session-stats">
        <div className="stat-card">
          <span className="stat-title">Upcoming</span>
          <span className="stat-value">{stats.upcoming}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Pending</span>
          <span className="stat-value">{stats.pending}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Completed</span>
          <span className="stat-value">{stats.completed}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Canceled</span>
          <span className="stat-value">{stats.canceled}</span>
        </div>
      </div>

      {/* View Toggle and Filters */}
      <div className="sessions-filters">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
          <button
            className={`filter-tab ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending
          </button>
          <button
            className={`filter-tab ${
              activeTab === "confirmed" ? "active" : ""
            }`}
            onClick={() => setActiveTab("confirmed")}
          >
            Confirmed
          </button>
          <button
            className={`filter-tab ${
              activeTab === "completed" ? "active" : ""
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
          <button
            className={`filter-tab ${activeTab === "canceled" ? "active" : ""}`}
            onClick={() => setActiveTab("canceled")}
          >
            Canceled
          </button>
        </div>
        <div className="view-toggle">
          <button
            className={`btn btn-sm ${
              view === "list" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setView("list")}
          >
            List
          </button>
          <button
            className={`btn btn-sm ${
              view === "calendar" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setView("calendar")}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {view === "calendar" && (
        <div className="session-calendar-view">
          {calendarLoading ? (
            <div className="calendar-loading">
              <Loader size="md" message="Loading calendar..." />
            </div>
          ) : (
            <Calendar events={calendarSessions} />
          )}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <>
          {loading ? (
            <Loader size="lg" fullWidth />
          ) : sessions.length === 0 ? (
            <EmptyState
              title="No sessions found"
              message={
                activeTab === "all"
                  ? "You don't have any sessions yet."
                  : `You don't have any ${activeTab} sessions.`
              }
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
              action={
                currentUser.role === "student" && (
                  <Link to="/tutors" className="btn btn-primary">
                    Find a Tutor
                  </Link>
                )
              }
            />
          ) : (
            <div className="sessions-grid">
              {sessions.map((session) => (
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
                    {currentUser.role === "tutor" ? (
                      <>
                        <h3>{session.studentId?.name || "Student"}</h3>
                        <div className="session-subject">
                          {session.subject || "General tutoring session"}
                        </div>
                      </>
                    ) : (
                      <>
                        <h3>{session.tutorId?.userId?.name || "Tutor"}</h3>
                        <div className="session-subject">
                          {session.subject || "General tutoring session"}
                        </div>
                      </>
                    )}
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
        </>
      )}
    </div>
  );
};

export default SessionsPage;
