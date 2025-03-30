import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sessionAPI } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";

const SessionEditPage = () => {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    timeSlot: "",
    type: "online",
  });

  const [originalSession, setOriginalSession] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth/login");
      return;
    }

    const fetchSession = async () => {
      try {
        const response = await sessionAPI.getSessionDetails(sessionId);
        if (response.data.success) {
          const sessionData = response.data.data;
          setOriginalSession(sessionData);

          const isStudent =
            currentUser._id === sessionData.studentId?._id ||
            currentUser._id === sessionData.studentId;

          const isTutor =
            currentUser.role === "tutor" &&
            (sessionData.tutorId?._id === currentUser.tutorProfile?._id ||
              sessionData.tutorId === currentUser.tutorProfile?._id);

          if (!isStudent && !isTutor && currentUser.role !== "admin") {
            navigate("/unauthorized");
            return;
          }

          if (!["pending", "confirmed"].includes(sessionData.status)) {
            toast.error(`Cannot edit a session that is ${sessionData.status}`);
            navigate(`/sessions/${sessionId}`);
            return;
          }

          setFormData({
            date: new Date(sessionData.date).toISOString().split("T")[0],
            timeSlot: sessionData.timeSlot,
            type: sessionData.type,
          });
        } else {
          setError("Failed to load session details");
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [currentUser, sessionId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (
        formData.date !== originalSession.date ||
        formData.timeSlot !== originalSession.timeSlot
      ) {
        const availabilityResponse = await sessionAPI.checkAvailability(
          originalSession.tutorId._id || originalSession.tutorId,
          formData.date,
          formData.timeSlot
        );

        if (
          !availabilityResponse.data.isAvailable &&
          availabilityResponse.data.existingSession?.id !== sessionId
        ) {
          toast.error("This time slot is already booked");
          setSubmitting(false);
          return;
        }
      }

      const response = await sessionAPI.updateSession(sessionId, formData);
      if (response.data.success) {
        toast.success("Session updated successfully!");
        navigate(`/sessions/${sessionId}`);
      } else {
        setError("Update failed");
        toast.error(
          "Update failed: " + (response.data.message || "Unknown error")
        );
      }
    } catch (err) {
      console.error("Error updating session:", err);
      setError(err.response?.data?.message || "An error occurred");
      toast.error(
        err.response?.data?.message ||
          "An error occurred while updating the session"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader size="lg" fullWidth />;

  return (
    <div className="session-edit-page">
      <div className="container">
        <h1 className="page-title">Edit Session</h1>

        <form className="session-form" onSubmit={handleSubmit}>
          <div className="form-control">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              className="input"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="form-control">
            <label htmlFor="timeSlot">Time Slot (e.g. 09:00-10:00)</label>
            <select
              id="timeSlot"
              name="timeSlot"
              className="input"
              value={formData.timeSlot}
              onChange={handleChange}
            >
              <option value="">Select a time slot</option>
              <option value="09:00-10:00">9:00 AM - 10:00 AM</option>
              <option value="10:00-11:00">10:00 AM - 11:00 AM</option>
              <option value="11:00-12:00">11:00 AM - 12:00 PM</option>
              <option value="12:00-13:00">12:00 PM - 1:00 PM</option>
              <option value="13:00-14:00">1:00 PM - 2:00 PM</option>
              <option value="14:00-15:00">2:00 PM - 3:00 PM</option>
              <option value="15:00-16:00">3:00 PM - 4:00 PM</option>
              <option value="16:00-17:00">4:00 PM - 5:00 PM</option>
              <option value="17:00-18:00">5:00 PM - 6:00 PM</option>
            </select>
          </div>
          <div className="form-control">
            <label htmlFor="type">Session Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input"
            >
              <option value="online">Online</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(`/sessions/${sessionId}`)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Update Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionEditPage;
