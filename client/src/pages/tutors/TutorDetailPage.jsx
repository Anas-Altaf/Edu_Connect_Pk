import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { tutorAPI, wishlistAPI } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";

const TutorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  useEffect(() => {
    const fetchTutorDetails = async () => {
      try {
        const response = await tutorAPI.getTutorDetails(id);
        if (response.data.success) {
          setTutor(response.data.data);

          if (currentUser && currentUser.role === "student") {
            try {
              const wishlistResponse = await wishlistAPI.getWishlist();
              if (wishlistResponse.data.success) {
                const tutorIds = wishlistResponse.data.data.tutorIds || [];
                setInWishlist(tutorIds.includes(id));
              }
            } catch (err) {
              console.error("Error checking wishlist:", err);
            }
          }
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
  }, [id, currentUser]);

  const handleToggleWishlist = async () => {
    if (!currentUser) {
      navigate("/auth/login");
      return;
    }

    if (currentUser.role !== "student") {
      toast.info("Only students can add tutors to wishlist");
      return;
    }

    setAddingToWishlist(true);
    try {
      if (inWishlist) {
        await wishlistAPI.removeFromWishlist(id);
        toast.success("Removed from wishlist");
        setInWishlist(false);
      } else {
        await wishlistAPI.addTutorToWishlist(id);
        toast.success("Added to wishlist");
        setInWishlist(true);
      }
    } catch (err) {
      console.error("Wishlist operation error:", err);
      toast.error("Failed to update wishlist");
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleBookSession = () => {
    if (!currentUser) {
      navigate("/auth/login");
      return;
    }

    navigate(`/sessions/book/${id}`);
  };

  if (loading) return <Loader size="lg" fullWidth />;

  if (error || !tutor) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">{error || "Tutor not found"}</div>
        <Link to="/tutors" className="btn btn-primary">
          Back to Tutors
        </Link>
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
    <div className="tutor-detail-page">
      <div className="tutor-profile-header">
        <div className="tutor-avatar-container">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={tutorName}
              className="tutor-avatar"
            />
          ) : (
            <div className="tutor-avatar-placeholder">{initials}</div>
          )}
        </div>
        <div className="tutor-header-info">
          <h1 className="tutor-name">{tutorName}</h1>
          <div className="tutor-meta">
            {tutor.averageRating > 0 && (
              <div className="tutor-rating-container">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`star ${
                        i < Math.round(tutor.averageRating) ? "filled" : ""
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="rating-text">
                  ({tutor.averageRating.toFixed(1)})
                </span>
              </div>
            )}
            {tutor.location && (
              <div className="location-info">
                <i className="icon-location"></i>
                <span>{tutor.location}</span>
              </div>
            )}
            {tutor.isVerified && (
              <div className="verified-badge">
                <i className="icon-check"></i>
                <span>Verified</span>
              </div>
            )}
          </div>
        </div>
        <div className="tutor-action-buttons">
          <button
            onClick={handleBookSession}
            className="btn btn-primary btn-block"
          >
            Book a Session
          </button>
          <button
            onClick={handleToggleWishlist}
            disabled={addingToWishlist}
            className={`btn ${
              inWishlist ? "btn-danger" : "btn-outline"
            } btn-block`}
          >
            {addingToWishlist
              ? "Updating..."
              : inWishlist
              ? "Remove from Wishlist"
              : "Add to Wishlist"}
          </button>
        </div>
      </div>

      <div className="tutor-profile-body">
        <div className="tutor-main-info">
          <div className="profile-section">
            <h2 className="section-title">About</h2>
            <div className="tutor-bio">
              {tutor.userId?.bio || (
                <span className="no-content">No bio provided</span>
              )}
            </div>
          </div>

          <div className="profile-section">
            <h2 className="section-title">Subjects</h2>
            {tutor.subjects && tutor.subjects.length > 0 ? (
              <div className="subject-tags">
                {tutor.subjects.map((subject, index) => (
                  <span key={index} className="subject-tag">
                    {subject}
                  </span>
                ))}
              </div>
            ) : (
              <span className="no-content">No subjects listed</span>
            )}
          </div>

          <div className="profile-section">
            <h2 className="section-title">Qualifications</h2>
            <div className="tutor-qualifications">
              {tutor.qualifications || (
                <span className="no-content">No qualifications provided</span>
              )}
            </div>
          </div>

          <div className="profile-section">
            <h2 className="section-title">Teaching Preference</h2>
            <div className="teaching-preference">
              {tutor.teachingPreference === "online" && "Online sessions"}
              {tutor.teachingPreference === "in-person" && "In-person sessions"}
              {tutor.teachingPreference === "both" &&
                "Online and in-person sessions"}
            </div>
          </div>
        </div>

        <div className="tutor-sidebar">
          <div className="tutor-info-card">
            <h3 className="card-title">Session Information</h3>
            <div className="info-item">
              <span className="info-label">Hourly Rate</span>
              <span className="info-value">Rs. {tutor.hourlyRate}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Teaching Experience</span>
              <span className="info-value">
                {tutor.reviews?.length || 0} sessions completed
              </span>
            </div>
          </div>

          {tutor.availability && tutor.availability.length > 0 && (
            <div className="tutor-info-card">
              <h3 className="card-title">Availability</h3>
              {tutor.availability.map((slot, index) => (
                <div key={index} className="info-item">
                  <span className="info-label">{slot.day}</span>
                  <span className="info-value">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Reviews Section */}
      <div className="reviews-section">
        <h2 className="section-title">Reviews</h2>
        {tutor.reviews && tutor.reviews.length > 0 ? (
          <div className="reviews-list">
            {tutor.reviews.map((review, index) => (
              <div key={index} className="review-item">
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`star ${i < review.rating ? "filled" : ""}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="review-text">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-content">No reviews yet</p>
        )}
        {currentUser && currentUser.role === "student" && (
          <div className="review-form">
            <h3>Submit a Review</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();

                toast.success("Review submitted!");
              }}
            >
              <div className="form-control">
                <label htmlFor="rating">Rating (1-5):</label>
                <input
                  type="number"
                  id="rating"
                  min="1"
                  max="5"
                  required
                  className="input"
                />
              </div>
              <div className="form-control">
                <label htmlFor="comment">Review:</label>
                <textarea id="comment" required className="input"></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                Submit Review
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorDetailPage;
