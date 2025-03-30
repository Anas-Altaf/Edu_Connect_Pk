/**
 * Format a date to a human readable distance to now (e.g. "2 days ago")
 * @param {Date} date - The date to format
 * @returns {string} - The formatted distance string
 */
export const formatDistanceToNow = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (isNaN(diffInSeconds)) {
    return "Invalid date";
  }

  // Less than a minute
  if (diffInSeconds < 60) {
    return "just now";
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }

  // Less than a month (30 days)
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }

  // Less than a year
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }

  // More than a year
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
};

/**
 * Format date to locale string
 * @param {Date} date - The date to format
 * @param {string} format - The format to use (short, medium, long)
 * @returns {string} - The formatted date string
 */
export const formatDate = (date, format = "medium") => {
  if (!date) return "";

  try {
    const dateObj = new Date(date);

    switch (format) {
      case "short":
        return dateObj.toLocaleDateString();
      case "long":
        return dateObj.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      case "time":
        return dateObj.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });
      case "datetime":
        return `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString(
          undefined,
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )}`;
      case "medium":
      default:
        return dateObj.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};
