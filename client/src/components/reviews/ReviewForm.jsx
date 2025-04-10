import { useState } from "react";
import StarRating from "../ui/StarRating";
import { toast } from "react-toastify";

const MIN_COMMENT_LENGTH = 10;
const maxChars = 500;

const ReviewForm = ({
  tutorId,
  onSubmit,
  onCancel,
  initialRating = 0,
  initialComment = "",
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError("Please select a rating");
      return;
    }
    if (comment.trim().length < MIN_COMMENT_LENGTH) {
      setError("Review comment must be at least 10 characters long");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit(rating, comment);
      toast.success("Review submitted successfully");
    } catch (err) {
      toast.error("Failed to submit review");
      setError("Failed to submit review");
      console.error("Review submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = comment.length;

  return (
    <div className="review-form-container">
      <h3>Write a Review</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-control rating-input">
          <label className="input-label">Rating</label>
          <div className="rating-stars">
            <StarRating value={rating} onChange={setRating} size="lg" />
            {rating > 0 && (
              <span className="rating-value ml-md">{rating} out of 5</span>
            )}
          </div>
        </div>
        <div className="form-control">
          <label htmlFor="review-comment" className="input-label">
            Comments
          </label>
          <textarea
            id="review-comment"
            className="input"
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, maxChars))}
            placeholder="Share your experience with this tutor"
            maxLength={maxChars}
          ></textarea>
          <div className="character-count">
            {charCount}/{maxChars}
          </div>
        </div>
        <div className="form-actions mt-md">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline"
              disabled={submitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
