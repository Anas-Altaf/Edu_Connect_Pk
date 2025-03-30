import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../services/api";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const response = await authAPI.forgotPassword(email);
      if (response.data.success) {
        setMessage("Reset password instructions have been sent to your email.");
      } else {
        setError("Failed to send reset instructions. Please try again.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("An error occurred. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-container">
          <h2 className="auth-title">Forgot Password</h2>

          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-control">
              <label htmlFor="email" className="input-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="input"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Send Reset Instructions"}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/sign-in">Back to Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
