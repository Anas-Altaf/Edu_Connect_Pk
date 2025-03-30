import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { sessionAPI } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";

const SessionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const response = await sessionAPI.getSessionDetails(id);
        if (response.data.success) {
          setSession(response.data.data);
        } else {
          setError("Failed to load session details");
        }
      } catch (err) {
        console.error("Error fetching session details:", err);
        setError("An error occurred while loading session details");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [id]);

  const handleStatusUpdate = async (status) => {
    setUpdateLoading(true);
    try {
      let response;
      if (status === "complete") {
        response = await sessionAPI.completeSession(id);
      } else if (status === "approve") {
        response = await sessionAPI.approveSession(id, true);
      } else if (status === "reject") {
        response = await sessionAPI.approveSession(id, false);
      } else if (status === "cancel") {
        response = await sessionAPI.cancelSession(id);
      }

      if (response?.data.success) {
        toast.success("Session status updated successfully!");
        // Refresh the session data
        const refreshResponse = await sessionAPI.getSessionDetails(id);
        if (refreshResponse.data.success) {
          setSession(refreshResponse.data.data);
        }
      } else {
        toast.error("Failed to update session status");
      }
    } catch (err) {
      console.error("Error updating session status:", err);
      toast.error("An error occurred while updating session status");
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <Loader size="lg" fullWidth />;

  if (error || !session) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">{error || "Session not found"}</div>
        <button
          onClick={() => navigate("/sessions")}
          className="btn btn-primary"
        >
          Back to Sessions
        </button>
      </div>
    );
  }

  const isTutor = currentUser?.role === "tutor";
  const isStudent = currentUser?.role === "student";
  const canEdit =
    (isStudent && ["pending", "confirmed"].includes(session.status)) ||
    (isTutor && session.status === "pending");

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "status-badge pending";
      case "confirmed":
        return "status-badge confirmed";
      case "completed":
        return "status-badge completed";
      case "canceled":
        return "status-badge canceled";
      default:
        return "status-badge";
    }
  };

  return (
    <div className="session-detail-page">
      <div className="page-header">
        <div className="header-left">
          <button
            onClick={() => navigate("/sessions")}
            className="btn btn-outline"
          >
            Back to All Sessions
          </button>
          <h1>Session Details</h1>
        </div>
        <div className="header-right">
          {canEdit && (
            <Link to={`/sessions/edit/${id}`} className="btn btn-primary">
              Edit Session
            </Link>
          )}
        </div>
      </div>

      <div className="session-detail-content">
        <div className="session-detail-card">
          <div className="detail-section">
            <div className="detail-header">
              <h2>Session Information</h2>
              <span className={getStatusBadgeClass(session.status)}>
                {session.status.charAt(0).toUpperCase() +
                  session.status.slice(1)}
              </span>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Date</span>
                <span className="detail-value">{formatDate(session.date)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Time</span>
                <span className="detail-value">
                  {session.timeSlot || "Not specified"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Type</span>
                <span className="detail-value">
                  {session.type === "online" ? "Online" : "In-person"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Amount</span>
                <span className="detail-value">Rs. {session.amount}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2>{isTutor ? "Student Information" : "Tutor Information"}</h2>
            <div className="participant-info">
              {isTutor ? (
                <div className="participant-card">
                  <div className="participant-avatar">
                    {session.studentId?.profilePicture ? (
                      <img
                        src={session.studentId.profilePicture}
                        alt="Student"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {session.studentId?.name?.charAt(0) || "S"}
                      </div>
                    )}
                  </div>
                  <div className="participant-details">
                    <h3>{session.studentId?.name || "Student"}</h3>
                    <p>{session.studentId?.email || "No email provided"}</p>
                  </div>
                </div>
              ) : (
                <div className="participant-card">
                  <div className="participant-avatar">
                    {session.tutorId?.userId?.profilePicture ? (
                      <img
                        src={session.tutorId.userId.profilePicture}
                        alt="Tutor"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {session.tutorId?.userId?.name?.charAt(0) || "T"}
                      </div>
                    )}
                  </div>
                  <div className="participant-details">
                    <h3>{session.tutorId?.userId?.name || "Tutor"}</h3>
                    <p>
                      {session.tutorId?.userId?.email || "No email provided"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {session.notes && (
            <div className="detail-section">
              <h2>Notes</h2>
              <div className="session-notes">
                <p>{session.notes}</p>
              </div>
            </div>
          )}

          <div className="detail-section">
            <h2>Actions</h2>
            <div className="session-actions">
              {isStudent && session.status === "pending" && (
                <button
                  onClick={() => handleStatusUpdate("cancel")}
                  className="btn btn-danger"
                  disabled={updateLoading}
                >
                  {updateLoading ? "Processing..." : "Cancel Session"}
                </button>
              )}

              {isTutor && session.status === "pending" && (
                <div className="tutor-actions">
                  <button
                    onClick={() => handleStatusUpdate("approve")}
                    className="btn btn-success"
                    disabled={updateLoading}
                  >
                    {updateLoading ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("reject")}
                    className="btn btn-danger"
                    disabled={updateLoading}
                  >
                    {updateLoading ? "Processing..." : "Reject"}
                  </button>
                </div>
              )}

              {isTutor && session.status === "confirmed" && (
                <button
                  onClick={() => handleStatusUpdate("complete")}
                  className="btn btn-primary"
                  disabled={updateLoading}
                >
                  {updateLoading ? "Processing..." : "Mark as Completed"}
                </button>
              )}

              {isTutor && session.status === "confirmed" && (
                <button
                  onClick={() => handleStatusUpdate("cancel")}
                  className="btn btn-outline btn-danger"
                  disabled={updateLoading}
                >
                  {updateLoading ? "Processing..." : "Cancel Session"}
                </button>
              )}

              {(session.status === "completed" ||
                session.status === "canceled") && (
                <p className="text-muted">
                  No actions available for this session.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailPage;
