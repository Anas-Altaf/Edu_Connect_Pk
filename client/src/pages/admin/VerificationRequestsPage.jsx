import React, { useState, useEffect } from "react";
import { verificationAPI } from "../../services/api";
import Loader from "../../components/ui/Loader";

const VerificationRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await verificationAPI.getPendingRequests(1, 20);
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching verification requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, status, comment = "") => {
    try {
      await verificationAPI.handleRequest(id, status, comment);
      // Refresh list after action
      fetchRequests();
    } catch (err) {
      console.error("Error handling verification request:", err);
    }
  };

  if (loading) return <Loader size="lg" fullWidth />;

  return (
    <div className="verification-requests-page">
      <h1>Verification Requests</h1>
      {requests.length ? (
        <ul className="verification-request-list">
          {requests.map((req) => (
            <li key={req._id} className="verification-request-item">
              <p>Tutor ID: {req.tutorId}</p>
              <p>Status: {req.status}</p>
              <div className="action-buttons">
                <button
                  onClick={() => handleAction(req._id, "approved")}
                  className="btn btn-success"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    handleAction(req._id, "rejected", "Invalid credentials")
                  }
                  className="btn btn-danger"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending verification requests.</p>
      )}
    </div>
  );
};

export default VerificationRequestsPage;
