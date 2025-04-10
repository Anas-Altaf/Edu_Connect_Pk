import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tutorAPI, sessionAPI } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";

const SessionBookingPage = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    timeSlot: "",
    type: "online",
    subject: "",
    notes: "",
  });

  useEffect(() => {
    // Debug the tutorId
    console.log("TutorId from params:", tutorId);

    if (!currentUser) {
      navigate("/auth/login");
      return;
    }

    if (currentUser.role !== "student") {
      navigate("/unauthorized");
      return;
    }

    // Validate tutorId
    console.log("Validating tutorId:", tutorId);
    console.log("tutorId type:", typeof tutorId);

    if (!tutorId || tutorId === "undefined" || tutorId === undefined) {
      console.error("Invalid tutorId detected:", tutorId);
      setError("Invalid tutor ID. Please go back and try again.");
      setLoading(false);
      return;
    }

    // Try to parse the tutorId to ensure it's a valid MongoDB ObjectId
    if (!/^[0-9a-fA-F]{24}$/.test(tutorId)) {
      console.error("Invalid MongoDB ObjectId format:", tutorId);
      setError("Invalid tutor ID format. Please go back and try again.");
      setLoading(false);
      return;
    }

    const fetchTutorDetails = async () => {
      try {
        const response = await tutorAPI.getTutorDetails(tutorId);
        if (response.data.success) {
          setTutor(response.data.data);
        } else {
          setError("Failed to load tutor details");
        }
      } catch (err) {
        console.error("Error fetching tutor details:", err);
        setError("An error occurred while loading tutor details");
      } finally {
        setLoading(false);
      }
    };

    fetchTutorDetails();
  }, [tutorId, currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.timeSlot) {
      toast.error("Please select a date and time slot");
      return;
    }

    // Validate tutorId before proceeding
    if (!tutorId || tutorId === "undefined") {
      toast.error(
        "Invalid tutor ID. Please try again or select a different tutor."
      );
      return;
    }

    setSubmitting(true);
    try {
      const availabilityResponse = await sessionAPI.checkAvailability(
        tutorId,
        formData.date,
        formData.timeSlot
      );

      if (!availabilityResponse.data.isAvailable) {
        toast.error("This time slot is no longer available");
        setSubmitting(false);
        return;
      }

      const [start, end] = formData.timeSlot.split("-");

      const formatTime = (timeStr) => {
        if (/^\d{2}:\d{2}$/.test(timeStr)) {
          return timeStr;
        }

        const parts = timeStr.split(":");
        const hour = parts[0].padStart(2, "0");
        const minute = parts.length > 1 ? parts[1].padStart(2, "0") : "00";
        return `${hour}:${minute}`;
      };

      const formattedStart = formatTime(start);
      const formattedEnd = formatTime(end);

      const bookingResponse = await sessionAPI.bookSession({
        tutorId,
        date: formData.date,
        start: formattedStart,
        end: formattedEnd,
        type: formData.type,
        subject: formData.subject,
        notes: formData.notes,
      });

      if (bookingResponse.data.success) {
        toast.success("Session booked successfully!");
        navigate(`/sessions/${bookingResponse.data.data._id}`);
      } else {
        toast.error(bookingResponse.data.message || "Failed to book session");
      }
    } catch (err) {
      console.error("Session booking error:", err);
      toast.error(
        err.response?.data?.message ||
          "An error occurred while booking the session"
      );
    } finally {
      setSubmitting(false);
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

  if (error || !tutor) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">{error || "Tutor not found"}</div>
        <div className="error-actions">
          <button onClick={() => navigate(-1)} className="btn btn-outline">
            Go Back
          </button>
          <button
            onClick={() => navigate("/tutors")}
            className="btn btn-primary"
          >
            Browse All Tutors
          </button>
        </div>
      </div>
    );
  }

  const tutorName = tutor.userId?.name || "Tutor";
  const profilePicture = tutor.userId?.profilePicture;
  const initials = tutorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="session-booking-page">
      <h1 className="page-title">Book a Session</h1>

      <div className="booking-container">
        <div className="booking-tutor-info">
          <div className="tutor-card">
            <div className="tutor-header">
              <div className="tutor-avatar">
                {profilePicture ? (
                  <img src={profilePicture} alt={tutorName} />
                ) : (
                  <div className="avatar-placeholder">{initials}</div>
                )}
              </div>
              <div className="tutor-info">
                <h3>{tutorName}</h3>
                {tutor.subjects && (
                  <div className="tutor-subjects">
                    {tutor.subjects.slice(0, 3).map((subject, index) => (
                      <span key={index} className="tutor-subject">
                        {subject}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* New Tutor Availability Section */}
            {tutor.availability && tutor.availability.length > 0 && (
              <div className="tutor-availability">
                <h4 className="availability-title">Availability</h4>
                <ul className="availability-list">
                  {tutor.availability.map((slot, index) => (
                    <li key={index} className="availability-slot">
                      {slot.day}: {slot.startTime} - {slot.endTime}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="session-booking-form">
          <h2 className="booking-form-title">Booking Details</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="form-section-title">Session Information</h3>

              <div className="form-control">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className="input"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="form-control">
                <label htmlFor="timeSlot">Time Slot</label>
                <select
                  id="timeSlot"
                  name="timeSlot"
                  className="input"
                  value={formData.timeSlot}
                  onChange={handleChange}
                  required
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
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="type"
                      value="online"
                      checked={formData.type === "online"}
                      onChange={handleChange}
                    />
                    Online
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="type"
                      value="in-person"
                      checked={formData.type === "in-person"}
                      onChange={handleChange}
                    />
                    In-Person
                  </label>
                </div>
              </div>

              <div className="form-control">
                <label htmlFor="subject">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  className="input"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a subject</option>
                  {tutor?.subjects?.map((subject, index) => (
                    <option key={index} value={subject}>
                      {subject}
                    </option>
                  ))}
                  <option value="General">General Tutoring</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Additional Information</h3>
              <div className="form-control">
                <label htmlFor="notes">Notes for the Tutor</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="input"
                  rows="4"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Let the tutor know what topics you'd like to cover, any specific questions you have, etc."
                ></textarea>
              </div>
            </div>

            {formData.date && formData.timeSlot && (
              <div className="booking-summary">
                <h3 className="form-section-title">Booking Summary</h3>
                <div className="summary-details">
                  <div className="summary-item">
                    <span className="summary-label">Date</span>
                    <span className="summary-value">
                      {formatDate(formData.date)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Time</span>
                    <span className="summary-value">{formData.timeSlot}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Type</span>
                    <span className="summary-value">
                      {formData.type === "online" ? "Online" : "In-person"}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Subject</span>
                    <span className="summary-value">
                      {formData.subject || "Not selected"}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Hourly Rate</span>
                    <span className="summary-value">
                      Rs. {tutor.hourlyRate}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Amount</span>
                    <span className="summary-value">
                      Rs. {tutor.hourlyRate}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Booking..." : "Book Session"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SessionBookingPage;
