import React from "react";
import { Link, useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-content">
        <h1 className="unauthorized-title">Access Denied</h1>
        <p className="unauthorized-text">
          You don't have permission to access this page. If you believe this is
          an error, please contact support.
        </p>
        <div className="action-buttons">
          <button onClick={() => navigate(-1)} className="btn btn-outline">
            Go Back
          </button>
          <Link to="/" className="btn btn-primary">
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
