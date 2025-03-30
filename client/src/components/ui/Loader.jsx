import React from "react";

const Loader = ({
  size = "md",
  fullWidth = false,
  message = null,
  icon = null,
}) => {
  const loaderClasses = `loader loader-${size}`;

  return (
    <div className={`loader-container ${fullWidth ? "w-full" : ""}`}>
      <div className={loaderClasses}></div>
      {message && <p className="loader-message">{message}</p>}
      {icon && <div className="loader-icon">{icon}</div>}
    </div>
  );
};

export default Loader;
