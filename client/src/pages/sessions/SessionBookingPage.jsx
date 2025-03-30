import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tutorAPI, sessionAPI } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";

const SessionBookingPage = () => {
  const { id: tutorId } = useParams();
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
    notes: "",
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!currentUser) {
      navigate("/auth/login");
      return;
    }

    // Only students can book sessions
    if (currentUser.role !== "student") {
      navigate("/unauthorized");
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

    setSubmitting(true);
    try {
      // Check if slot is available
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

      // Split timeSlot into start and end times
      const [start, end] = formData.timeSlot.split("-");

      // Ensure that start and end have the correct format (HH:MM)
      const formatTime = (timeStr) => {
        // If the time is already in HH:MM format, return as is
        if (/^\d{2}:\d{2}$/.test(timeStr)) {
          return timeStr;
        }

        // Otherwise, assume it needs formatting
        const parts = timeStr.split(":");
        const hour = parts[0].padStart(2, "0");
        const minute = parts.length > 1 ? parts[1].padStart(2, "0") : "00";
        return `${hour}:${minute}`;
      };

      const formattedStart = formatTime(start);
      const formattedEnd = formatTime(end);

      // Book the session
      const bookingResponse = await sessionAPI.bookSession({
        tutorId,
        date: formData.date, // Use ISO date format YYYY-MM-DD
        start: formattedStart, // Send formatted start time HH:MM
        end: formattedEnd, // Send formatted end time HH:MM
        type: formData.type,
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

  // Format date for display
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
        <button onClick={() => navigate("/tutors")} className="btn btn-primary">
          Back to Tutors
        </button>
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
