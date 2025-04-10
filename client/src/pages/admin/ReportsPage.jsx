import React, { useState, useEffect } from "react";
import { reportAPI } from "../../services/api";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";

const ReportsPage = () => {
  const [reportType, setReportType] = useState("subjects");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let response;
      switch (reportType) {
        case "subjects":
          response = await reportAPI.getSubjectsReport(startDate, endDate);
          break;
        case "sessions":
          response = await reportAPI.getSessionsReport(startDate, endDate);
          break;
        case "locations":
          response = await reportAPI.getLocationsReport(startDate, endDate);
          break;
        case "growth":
          response = await reportAPI.getGrowthReport(startDate, endDate);
          break;
        default:
          response = await reportAPI.getSubjectsReport(startDate, endDate);
      }

      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        toast.error("Failed to load report data");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("An error occurred while loading report data");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const response = await reportAPI.exportReportData(
        reportType,
        format,
        startDate,
        endDate
      );

      if (format === "csv" && response.data) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else if (response.data.success) {
        toast.success("Report exported successfully");
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report data");
    }
  };

  const renderSubjectReport = (data) => {
    if (!data || !data.subjects || data.subjects.length === 0) {
      return (
        <div className="empty-state">
          <p>No subject data available for the selected period.</p>
        </div>
      );
    }

    const maxCount = Math.max(...data.subjects.map((s) => s.count));

    return (
      <div className="chart-container">
        <h3 className="chart-title">Most Popular Subjects</h3>
        <div className="chart-content">
          <div className="bar-chart">
            {data.subjects.map((subject, index) => (
              <div key={index} className="bar-item">
                <span className="bar-label">{subject.subject}</span>
                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      width: `${(subject.count / maxCount) * 100}%`,
                      backgroundColor: "var(--primary)",
                    }}
                  />
                  <span className="bar-value">{subject.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSessionReport = (data) => {
    if (!data || !data.summary) {
      return (
        <div className="empty-state">
          <p>No session data available for the selected period.</p>
        </div>
      );
    }

    return (
      <div className="report-grid">
        <div className="stats-container">
          <div className="stats-card">
            <div className="stats-icon">📊</div>
            <div className="stats-info">
              <div className="stats-value">{data.summary.total || 0}</div>
              <div className="stats-title">Total Sessions</div>
            </div>
          </div>
          <div className="stats-card stats-card-info">
            <div className="stats-icon">⏳</div>
            <div className="stats-info">
              <div className="stats-value">{data.summary.pending || 0}</div>
              <div className="stats-title">Pending</div>
            </div>
          </div>
          <div className="stats-card stats-card-success">
            <div className="stats-icon">✅</div>
            <div className="stats-info">
              <div className="stats-value">{data.summary.completed || 0}</div>
              <div className="stats-title">Completed</div>
            </div>
          </div>
          <div className="stats-card stats-card-danger">
            <div className="stats-icon">❌</div>
            <div className="stats-info">
              <div className="stats-value">{data.summary.canceled || 0}</div>
              <div className="stats-title">Canceled</div>
            </div>
          </div>
        </div>

        {data.byType && (
          <div className="chart-container">
            <h3 className="chart-title">Session Types</h3>
            <div className="chart-content">
              <div className="pie-chart">
                <div className="pie-chart-legend">
                  {Object.entries(data.byType).map(([type, count], index) => (
                    <div key={index} className="legend-item">
                      <span
                        className="legend-color"
                        style={{
                          backgroundColor:
                            type === "online"
                              ? "var(--info)"
                              : "var(--success)",
                        }}
                      ></span>
                      <span className="legend-label">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                      <span className="legend-value">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLocationReport = (data) => {
    if (!data || !data.cities || data.cities.length === 0) {
      return (
        <div className="empty-state">
          <p>No location data available for the selected period.</p>
        </div>
      );
    }

    const maxCount = Math.max(...data.cities.map((c) => c.count));

    return (
      <div className="chart-container">
        <h3 className="chart-title">Usage by City</h3>
        <div className="chart-content">
          <div className="bar-chart">
            {data.cities.map((city, index) => (
              <div key={index} className="bar-item">
                <span className="bar-label">{city.city || "Unknown"}</span>
                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      width: `${(city.count / maxCount) * 100}%`,
                      backgroundColor: "var(--accent)",
                    }}
                  />
                  <span className="bar-value">{city.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGrowthReport = (data) => {
    if (!data || !data.growth || data.growth.length === 0) {
      return (
        <div className="empty-state">
          <p>No growth data available for the selected period.</p>
        </div>
      );
    }

    return (
      <div className="chart-container">
        <h3 className="chart-title">User Growth</h3>
        <div className="chart-content">
          <div className="line-chart">
            {/* Placeholder for a line chart, in a real app you might use a charting library */}
            <div className="line-chart-summary">
              <div className="summary-card">
                <div className="summary-title">Total Users</div>
                <div className="summary-value">{data.totalUsers}</div>
              </div>
              <div className="summary-card">
                <div className="summary-title">New Users</div>
                <div className="summary-value">{data.newUsersInPeriod}</div>
                <div className="summary-change positive">
                  +
                  {(
                    (data.newUsersInPeriod /
                      Math.max(1, data.totalUsers - data.newUsersInPeriod)) *
                    100
                  ).toFixed(1)}
                  %
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-title">Average Growth</div>
                <div className="summary-value">
                  {(data.averageGrowthRate * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="report-loading">
          <Loader size="md" />
          <div>Loading report data...</div>
        </div>
      );
    }

    if (!reportData) {
      return (
        <div className="empty-state">
          <p>Select a report type and date range to generate a report.</p>
        </div>
      );
    }

    switch (reportType) {
      case "subjects":
        return renderSubjectReport(reportData);
      case "sessions":
        return renderSessionReport(reportData);
      case "locations":
        return renderLocationReport(reportData);
      case "growth":
        return renderGrowthReport(reportData);
      default:
        return <div>Select a report type</div>;
    }
  };

  return (
    <div className="admin-page reports-page">
      <div className="admin-header">
        <h1 className="admin-title">Analytics & Reports</h1>
        <p className="admin-description">
          View and analyze platform data and metrics
        </p>
      </div>

      <div className="reports-controls">
        <div className="filter-section">
          <div className="filter-group">
            <label htmlFor="report-type">Report Type:</label>
            <select
              id="report-type"
              className="input"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="subjects">Popular Subjects</option>
              <option value="sessions">Session Statistics</option>
              <option value="locations">Usage by City</option>
              <option value="growth">User Growth</option>
            </select>
          </div>

          <div className="date-range">
            <div className="filter-group">
              <label htmlFor="start-date">Start Date:</label>
              <input
                type="date"
                id="start-date"
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
              />
            </div>
            <div className="filter-group">
              <label htmlFor="end-date">End Date:</label>
              <input
                type="date"
                id="end-date"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <button className="btn btn-primary" onClick={fetchReport}>
            Generate Report
          </button>
        </div>

        <div className="export-section">
          <div className="filter-group">
            <label>Export Report:</label>
            <div className="export-controls">
              <button
                className="btn btn-outline"
                onClick={() => exportReport("csv")}
                disabled={!reportData}
              >
                Export CSV
              </button>
              <button
                className="btn btn-outline"
                onClick={() => exportReport("json")}
                disabled={!reportData}
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="report-container">{renderReportContent()}</div>
    </div>
  );
};

export default ReportsPage;
