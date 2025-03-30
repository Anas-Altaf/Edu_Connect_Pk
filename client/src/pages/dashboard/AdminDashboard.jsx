import React, { useState, useEffect } from "react";
import Loader from "../../components/ui/Loader";
import { tutorAPI, reportAPI } from "../../services/api";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const verResponse = await tutorAPI.getVerificationRequests();
        if (verResponse.data.success) {
          setVerificationRequests(verResponse.data.data);
        } else {
          toast.error("Failed to load verification requests");
        }
        // Example: fetch a subjects report
        const repResponse = await reportAPI.getSubjectsReport();
        if (repResponse.data.success) {
          setReportData(repResponse.data.data);
        } else {
          toast.error("Failed to load report");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading admin dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <Loader size="lg" fullWidth />;

  return (
    <div className="admin-dashboard">
      <h1 className="page-title">Admin Dashboard</h1>
      <div className="verification-requests">
        <h2>Pending Tutor Verifications</h2>
        {verificationRequests.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          verificationRequests.map((req) => (
            <div key={req._id} className="verification-card">
              <h3>{req.tutorName}</h3>
              <p>{req.credentials}</p>
              <div className="verification-actions">
                <button className="btn btn-success">Approve</button>
                <button className="btn btn-danger">Reject</button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="reports-section">
        <h2>Reports</h2>
        {reportData ? (
          <div className="report-card">
            <p>Total Subjects: {reportData.totalSubjects}</p>
            <p>
              Most Popular Subject:{" "}
              {reportData.mostPopular && reportData.mostPopular.length > 0
                ? reportData.mostPopular[0].subject
                : "N/A"}
            </p>
          </div>
        ) : (
          <p>No report data available.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
