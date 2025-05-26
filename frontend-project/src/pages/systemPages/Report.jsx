import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const Report = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [reportData, setReportData] = useState(null);

  const fetchReport = async () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }
    try {
      const res = await axios.get(`http://localhost:5000/api/report/daily?date=${selectedDate}`);
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
      alert('Failed to fetch report');
    }
  };

  const downloadCSV = () => {
    if (!reportData || !reportData.remainingStock) return;

    const headers = ['Spare Part', 'Category', 'Quantity', 'Unit Price'];
    const rows = reportData.remainingStock.map(item => [
      item.name,
      item.category,
      item.quantity,
      item.unitPrice
    ]);

    let csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `daily_report_${selectedDate}.csv`;
    a.click();
  };

  return (
    <div>
      <Navbar />
      <div className='flex justify-center pt-6'>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Daily Report</h1>
          <div className="flex space-x-4 items-center mb-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 border rounded"
            />
            <button
              onClick={fetchReport}
              className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
            >
              Generate Report
            </button>
            {reportData && (
              <button
                onClick={downloadCSV}
                className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
              >
                Download CSV
              </button>
            )}
          </div>

          {reportData ? (
            <>
              <div className="mb-4">
                <p><strong>Date:</strong> {reportData.date}</p>
                <p><strong>Total Stock In:</strong> {reportData.totalStockIn}</p>
                <p><strong>Total Stock Out:</strong> {reportData.totalStockOut}</p>
                <p><strong>Total Sales:</strong> ${reportData.totalSales.toFixed(2)}</p>
              </div>

              <table className="w-full border text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Spare Part</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Quantity</th>
                    <th className="p-2">Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.remainingStock.map(item => (
                    <tr key={item.spareId} className="border-t">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.category}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">${item.unitPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="text-gray-500">No report data to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;
