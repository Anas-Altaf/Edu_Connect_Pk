import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { sessionAPI } from "../../services/api";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

const SessionCalendar = ({ userId, userRole, tutorId }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate the dates for the current week view using useMemo
  const weekDates = useMemo(() => {
    const generateWeekDates = (date) => {
      const currentDay = date.getDay(); // 0-6, where 0 is Sunday
      const startDate = new Date(date);
      startDate.setDate(date.getDate() - currentDay); // Go to the start of week (Sunday)

      const dates = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        dates.push(day);
      }
      return dates;
    };

    return generateWeekDates(currentDate);
  }, [currentDate]);

  // Fetch sessions for the current week
  useEffect(() => {
    const fetchSessions = async () => {
      if (!weekDates.length || !userId) return;

      setLoading(true);
      try {
        // First day of the week
        const startDate = weekDates[0].toISOString().split("T")[0];
        // Last day of the week plus 1 day (to include all sessions on the last day)
        const endDate = new Date(weekDates[6]);
        endDate.setDate(endDate.getDate() + 1);
        const endDateStr = endDate.toISOString().split("T")[0];

        // Fetch sessions based on user role
        const fetchFunction =
          userRole === "tutor"
            ? sessionAPI.getTutorSessions
            : sessionAPI.getStudentSessions;

        const response = await fetchFunction(userId, {
          startDate,
          endDate: endDateStr,
          status: ["confirmed", "pending"], // Only get confirmed and pending sessions for calendar
        });

        if (response.data.success) {
          setSessions(response.data.data);
        } else {
          setError("Failed to load sessions");
        }
      } catch (err) {
        console.error("Error fetching sessions for calendar:", err);
        setError("An error occurred while loading sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [weekDates, userId, userRole]);

  // Navigate to previous week
  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  // Navigate to next week
  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Jump to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format date for display
  const formatDate = (date) => {
    return date.getDate();
  };

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get sessions for a specific date and time slot
  const getSessionsFor = (date, timeSlot) => {
    // Ensure date is valid
    if (!(date instanceof Date) || isNaN(date.getTime())) return [];
    const dateStr = date.toISOString().split("T")[0];

    return sessions.filter((session) => {
      // Parse session date
      const sessionDate = new Date(session.date);
      if (isNaN(sessionDate.getTime())) return false;
      const sessionDateStr = sessionDate.toISOString().split("T")[0];

      // If session.startTime exists, use it; otherwise fall back
      let sessionStart = "";
      if (session.startTime) {
        // Format to HH:MM using locale formatting without seconds
        sessionStart = new Date(session.startTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      } else if (session.timeSlot) {
        sessionStart = session.timeSlot.split("-")[0].trim();
      }

      return sessionDateStr === dateStr && sessionStart === timeSlot;
    });
  };

  // Get status class for a session
  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "confirmed";
      case "pending":
        return "pending";
      default:
        return "";
    }
  };

  // Handle session click
  const handleSessionClick = async (sessionId) => {
    try {
      // Optionally, you could fetch details if needed:
      // const response = await sessionAPI.getSessionDetails(sessionId);
      // Navigate to the session detail page
      navigate(`/sessions/${sessionId}`);
    } catch (error) {
      console.error("Error handling session click:", error);
    }
  };

  // Get time display format
  const formatTimeDisplay = (time) => {
    const hour = parseInt(time);
    return `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="session-calendar">
      <div className="calendar-nav">
        <button onClick={previousWeek} className="btn btn-sm btn-outline">
          ← Previous Week
        </button>
        <button onClick={goToToday} className="btn btn-sm btn-primary">
          Today
        </button>
        <button onClick={nextWeek} className="btn btn-sm btn-outline">
          Next Week →
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className={`calendar-container ${loading ? "loading" : ""}`}>
        <div className="calendar-header">
          <div className="time-column"></div>
          {weekDates.map((date, index) => (
            <div
              key={index}
              className={`date-column ${isToday(date) ? "today" : ""}`}
            >
              <div className="weekday">{DAYS_OF_WEEK[date.getDay()]}</div>
              <div className="date">{formatDate(date)}</div>
            </div>
          ))}
        </div>

        <div className="calendar-body">
          {TIME_SLOTS.map((timeSlot, timeIndex) => (
            <div key={timeIndex} className="time-row">
              <div className="time-label">{formatTimeDisplay(timeSlot)}</div>

              {weekDates.map((date, dateIndex) => {
                const dateStr = date.toISOString().split("T")[0];
                const sessionsAtSlot = getSessionsFor(date, timeSlot);

                return (
                  <div
                    key={dateIndex}
                    className={`time-cell ${isToday(date) ? "today" : ""}`}
                  >
                    {sessionsAtSlot.length > 0 ? (
                      sessionsAtSlot.map((session) => (
                        <div
                          key={session._id}
                          className={`calendar-session ${getStatusClass(
                            session.status
                          )}`}
                          onClick={() => handleSessionClick(session._id)}
                        >
                          {userRole === "tutor"
                            ? session.studentId?.userId?.name
                            : session.tutorId?.userId?.name}
                        </div>
                      ))
                    ) : userRole === "student" && tutorId ? (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() =>
                          navigate(
                            `/sessions/book/${tutorId}?date=${dateStr}&time=${timeSlot}`
                          )
                        }
                      >
                        Book
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="calendar-loading-overlay">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default SessionCalendar;
