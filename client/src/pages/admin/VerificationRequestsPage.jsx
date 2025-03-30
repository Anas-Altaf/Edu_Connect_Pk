import React, { useState, useEffect } from "react";
import { verificationAPI } from "../../services/api";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";

const VerificationRequestsPage = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchVerifications();
  }, [page]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const response = await verificationAPI.getPendingRequests(page, 10);
      if (response.data.success) {
        setVerifications(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        toast.error("Failed to load verification requests");
      }
    } catch (error) {
      console.error("Error fetching verification requests:", error);
      toast.error("An error occurred while loading verification requests");
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = async (id) => {
    try {
      const response = await verificationAPI.getVerificationById(id);
      if (response.data.success) {
        setSelectedRequest(response.data.data);
      } else {
        toast.error("Failed to load verification details");
      }
    } catch (error) {
      console.error("Error fetching verification details:", error);
      toast.error("An error occurred while loading verification details");
    }
  };

  const handleRequestAction = async (id, status) => {
    try {
      const response = await verificationAPI.handleRequest(id, status, comment);
      if (response.data.success) {
        toast.success(
          `Verification request ${
            status === "approved" ? "approved" : "rejected"
          }`
        );

        setVerifications(verifications.filter((v) => v._id !== id));
        setSelectedRequest(null);
        setComment("");
      } else {
        toast.error(
          `Failed to ${status === "approved" ? "approve" : "reject"} request`
        );
      }
    } catch (error) {
      console.error("Error handling verification request:", error);
      toast.error(
        `An error occurred while ${
          status === "approved" ? "approving" : "rejecting"
        } the request`
      );
    }
  };

  const closeDetailView = () => {
    setSelectedRequest(null);
    setComment("");
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Verification Requests</h1>
        <p className="admin-description">
          Review and manage tutor verification requests
        </p>
      </div>

      {loading ? (
        <Loader size="lg" fullWidth />
      ) : (
        <div className="verification-container">
          {selectedRequest ? (
            <div className="verification-details">
              <div className="verification-header">
                <h2>Verification Request Details</h2>
                <button className="btn btn-outline" onClick={closeDetailView}>
                  Back to List
                </button>
              </div>

              <div className="verification-content">
                <div className="verification-meta">
                  <div className="meta-item">
                    <span className="meta-label">Request ID:</span>
                    <span className="meta-value">{selectedRequest._id}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Submitted:</span>
                    <span className="meta-value">
                      {new Date(selectedRequest.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="verification-user">
                  <h3>Tutor Information</h3>
                  <div className="user-card">
                    <div className="user-info">
                      <div className="user-name">
                        {selectedRequest.userId?.name || "Unknown"}
                      </div>
                      <div className="user-email">
                        {selectedRequest.userId?.email || "No email"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="verification-documents">
                  <h3>Submitted Documents</h3>
                  {selectedRequest.documents?.length > 0 ? (
                    <ul className="document-list">
                      {selectedRequest.documents.map((doc, index) => (
                        <li key={index} className="document-item">
                          <div className="document-type">{doc.type}</div>
                          <div className="document-url">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline"
                            >
                              View Document
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-documents">No documents submitted</p>
                  )}
                </div>

                <div className="verification-qualification">
                  <h3>Qualifications</h3>
                  <div className="qualification-details">
                    {selectedRequest.qualifications ? (
                      <div className="qualification-text">
                        {selectedRequest.qualifications}
                      </div>
                    ) : (
                      <p className="no-qualifications">
                        No qualification details provided
                      </p>
                    )}
                  </div>
                </div>

                <div className="verification-action">
                  <h3>Admin Action</h3>
                  <div className="comment-input">
                    <label htmlFor="admin-comment">
                      Admin Comment (optional):
                    </label>
                    <textarea
                      id="admin-comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment about your decision..."
                      rows={3}
                      className="input"
                    ></textarea>
                  </div>
                  <div className="action-buttons">
                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        handleRequestAction(selectedRequest._id, "rejected")
                      }
                    >
                      Reject
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={() =>
                        handleRequestAction(selectedRequest._id, "approved")
                      }
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : verifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h2>No Pending Verification Requests</h2>
              <p>
                There are no tutor verification requests pending review at this
                time.
              </p>
            </div>
          ) : (
            <div className="verifications-list">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tutor</th>
                      <th>Email</th>
                      <th>Submitted Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map((verification) => (
                      <tr key={verification._id}>
                        <td>{verification.userId?.name || "Unknown"}</td>
                        <td>{verification.userId?.email || "No email"}</td>
                        <td>
                          {new Date(
                            verification.createdAt
                          ).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleViewRequest(verification._id)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationRequestsPage;
