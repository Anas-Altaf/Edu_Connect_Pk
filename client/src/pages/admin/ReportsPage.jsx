import React, { useState } from "react";
import { reportAPI } from "../../services/api";

const ReportsPage = () => {
  const [reportType, setReportType] = useState("subjects");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);

  const fetchReport = async () => {
    try {
      let response;
      if (reportType === "subjects") {
        response = await reportAPI.getSubjectsReport(startDate, endDate);
      } else if (reportType === "sessions") {
        response = await reportAPI.getSessionsReport(startDate, endDate);
      } else if (reportType === "locations") {
        response = await reportAPI.getLocationsReport(startDate, endDate);
      } else if (reportType === "growth") {
        response = await reportAPI.getGrowthReport(startDate, endDate);
      }
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
    }
  };

  return (
    <div className="reports-page">
      <h1>Reporting Dashboard</h1>
      <div className="report-controls">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="subjects">Popular Subjects</option>
          <option value="sessions">Session Statistics</option>
          <option value="locations">Usage by City</option>
          <option value="growth">User Growth</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={fetchReport} className="btn btn-primary">
          Fetch Report
        </button>
      </div>
      <div className="report-display">
        {reportData ? (
          <pre>{JSON.stringify(reportData, null, 2)}</pre>
        ) : (
          <p>No report data. Adjust filters and fetch a report.</p>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
