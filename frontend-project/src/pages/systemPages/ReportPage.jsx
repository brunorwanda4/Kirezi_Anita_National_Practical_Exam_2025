import React, { useState } from "react";
import apiClient from "../../api";

const ReportPage = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    if (!selectedDate) {
      setError("Please select a date");
      return;
    }
    setIsLoading(true);
    setError("");
    setReportData(null);
    try {
      // Corrected API endpoint
      const res = await apiClient.get(`/reports/daily?date=${selectedDate}`);
      setReportData(res.data);
    } catch (err) {
      console.error("Failed to fetch report:", err);
      setError(
        err.response?.data?.error || "Failed to fetch report. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData || !reportData.current_stock_levels) {
      setError("No data available to download.");
      return;
    }

    const headers = ["ID", "Spare Part Name", "Quantity", "Unit Price"];
    // Assuming backend 'current_stock_levels' is an array of objects {id, name, quantity, unit_price}
    const rows = reportData.current_stock_levels.map((item) => [
      item.id,
      item.name,
      item.quantity,
      item.unit_price  || "0.00",
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\r\n";
    rows.forEach((rowArray) => {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `daily_stock_report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-content">
        Daily Financial & Stock Report
      </h1>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Select Report Date</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input input-bordered input-primary"
              />
            </div>
            <button
              onClick={fetchReport}
              className="btn btn-primary self-end"
              disabled={isLoading}
            >
              {isLoading && !reportData ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Generate Report"
              )}
            </button>
            {reportData && (
              <button onClick={downloadCSV} className="btn btn-accent self-end">
                Download Stock CSV
              </button>
            )}
          </div>
          {error && (
            <div role="alert" className="alert alert-error">
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {isLoading && !reportData && (
        <div className="text-center py-10">
          <span className="loading loading-lg loading-spinner text-primary"></span>
          <p>Generating report...</p>
        </div>
      )}

      {reportData && (
        <div className="space-y-6">
          <div className="stats shadow stats-vertical lg:stats-horizontal bg-primary text-primary-content">
            <div className="stat">
              <div className="stat-title">Report Date</div>
              <div className="stat-value">
                {new Date(reportData.date).toLocaleDateString()}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Stock In (Units)</div>
              <div className="stat-value">{reportData.total_stock_in}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Stock Out (Units)</div>
              <div className="stat-value">{reportData.total_stock_out}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Sales</div>
              <div className="stat-value">
                ${reportData.total_sales }
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-secondary">
                Current Stock Levels
              </h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead className="bg-neutral text-neutral-content">
                    <tr>
                      <th>ID</th>
                      <th>Spare Part Name</th>
                      <th>Quantity</th>
                      <th>Unit Price (Cost)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.current_stock_levels &&
                    reportData.current_stock_levels.length > 0 ? (
                      reportData.current_stock_levels.map((item) => (
                        <tr key={item.id} className="hover">
                          <td>{item.id}</td>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>${item.unit_price }</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          No stock data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ReportPage;
