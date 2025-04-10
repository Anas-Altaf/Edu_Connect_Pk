import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const TutorCard = ({ tutor, inWishlist, showBookButton, onToggleWishlist }) => {
  const navigate = useNavigate();
  const [isToggling, setIsToggling] = useState(false);

  const tutorName = tutor?.userId?.name || "Tutor";
  const profilePicture = tutor?.userId?.profilePicture;
  const initials = tutorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const subjects = tutor?.subjects || [];
  const hourlyRate = tutor?.hourlyRate || 0;
  const location =
    tutor?.userId?.location || tutor?.location || "Location not specified";
  const bio = tutor?.userId?.bio || "No bio provided";

  const handleBookSession = (e) => {
    e.preventDefault();
    e.stopPropagation();


    // Ensure tutor._id is valid before navigating
    if (tutor && tutor._id) {
      const bookingUrl = `/sessions/book/${tutor._id}`;
      navigate(bookingUrl);
    } else {
      console.error("Invalid tutor ID");
      // Add toast notification
      toast.error("Invalid tutor ID. Please try again.");
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isToggling || !onToggleWishlist) return;

    setIsToggling(true);
    try {
      await onToggleWishlist(tutor._id);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Link to={`/tutors/${tutor._id}`} className="tutor-card">
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
          <div className="tutor-rating">
            {/* We can add star rating component here */}
            <span className="star">★</span>
            <span className="rating-value">
              {tutor.averageRating?.toFixed(1) || "New"}
            </span>
          </div>
          <div className="tutor-location">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="location-icon"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {location}
          </div>
        </div>
      </div>
      <div className="tutor-body">
        <div className="tutor-subjects">
          {subjects.slice(0, 3).map((subject, index) => (
            <span key={index} className="tutor-subject">
              {subject}
            </span>
          ))}
          {subjects.length > 3 && (
            <span className="tutor-subject">+{subjects.length - 3}</span>
          )}
        </div>
        <p className="tutor-rate">Rs. {hourlyRate} / hour</p>
        <p className="tutor-description">{bio}</p>
      </div>
      <div className="tutor-footer">
        {onToggleWishlist && (
          <button
            className={`wishlist-btn ${inWishlist ? "active" : ""}`}
            onClick={handleWishlistToggle}
            disabled={isToggling}
          >
            {inWishlist ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            ) : (
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
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            )}
          </button>
        )}
        {showBookButton && (
          <button
            className="btn btn-primary btn-sm"
            onClick={handleBookSession}
          >
            Book Session
          </button>
        )}
      </div>
    </Link>
  );
};

export default TutorCard;
