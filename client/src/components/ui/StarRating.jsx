import React from "react";

const StarRating = ({ value = 0, onChange, size = "md", readOnly = false }) => {
  const maxStars = 5;

  const handleStarClick = (rating) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= value ? "filled" : ""} ${
            size ? `star-${size}` : ""
          } ${readOnly ? "read-only" : ""}`}
          onClick={() => handleStarClick(i)}
        >
          {i <= value ? "★" : "☆"}
        </span>
      );
    }

    return stars;
  };

  return (
    <div className="star-rating" role="group">
      {renderStars()}
    </div>
  );
};

export default StarRating;
