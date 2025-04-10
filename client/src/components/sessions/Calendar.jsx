import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Calendar = ({ events = [] }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const getWeekDays = () => {
    const sunday = new Date(currentDate);
    sunday.setDate(currentDate.getDate() - currentDate.getDay());

    const result = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      result.push(day);
    }
    return result;
  };

  const weekDays = getWeekDays();

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getEventsForDay = (date) => {
    if (!events || !Array.isArray(events)) return [];

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return events.filter((event) => {
      if (!event.start) return false;

      const eventDate = new Date(event.start);
      return eventDate >= dayStart && eventDate <= dayEnd;
    });
  };

  const formatDate = (date) => {
    return date.getDate();
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "pending";
      case "confirmed":
        return "confirmed";
      case "completed":
        return "completed";
      case "canceled":
        return "canceled";
      default:
        return "";
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/sessions/${eventId}`);
  };

  return (
    <div className="session-calendar">
      <div className="calendar-nav">
        <button onClick={previousWeek} className="btn btn-outline btn-sm">
          &lt; Previous Week
        </button>
        <h3>
          {monthName} {year}
        </h3>
        <button onClick={nextWeek} className="btn btn-outline btn-sm">
          Next Week &gt;
        </button>
      </div>

      <div className="calendar-container">
        <div className="calendar-header">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`date-column ${isToday(day) ? "today" : ""}`}
            >
              <div className="weekday">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="date">{formatDate(day)}</div>
            </div>
          ))}
        </div>

        <div className="calendar-body">
          {weekDays.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className={`calendar-day-column ${isToday(day) ? "today" : ""}`}
            >
              {getEventsForDay(day).map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  className={`calendar-event ${getStatusClass(event.status)}`}
                  onClick={() => handleEventClick(event.id)}
                >
                  <div className="event-time">
                    {formatTime(event.start)} - {formatTime(event.end)}
                  </div>
                  <div className="event-title">{event.title}</div>
                </div>
              ))}
              {getEventsForDay(day).length === 0 && (
                <div className="no-events">No sessions</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
