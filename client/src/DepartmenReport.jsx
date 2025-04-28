import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const DepartmentReport = () => {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [reportData, setReportData] = useState([]);
  const [error, setError] = useState("");

  const departments = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "AI&DS"];
  const batches = ["2021-2025", "2022-2026", "2023-2027", "2024-2028", "2025-2029"];

  // Add date validation
  const today = new Date().toISOString().split("T")[0];

  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate > today) {
      toast.warn("Start date cannot be in the future!", { position: "top-right" });
      return;
    }
    setStartDate(selectedDate);
  };

  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate > today) {
      toast.warn("End date cannot be in the future!", { position: "top-right" });
      return;
    }
    if (startDate && selectedDate < startDate) {
      toast.warn("End date cannot be before start date!", { position: "top-right" });
      return;
    }
    setEndDate(selectedDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setReportData([]);

    // Frontend validation
    if (!selectedDept || !selectedBatch || !startDate || !endDate) {
      toast.warn("⚠️ Please fill in all fields.", { position: "top-right" });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.warn("⚠️ Start date cannot be after end date!", { position: "top-right" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/attendance/department-report?department=${selectedDept}&batch=${selectedBatch}&startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.length === 0) {
          toast.info("ℹ️ No records found for the selected criteria.", { position: "top-right" });
        } else {
          setReportData(data);
          toast.success("✅ Report generated successfully!", { position: "top-right" });
        }
      } else {
        throw new Error(data.error || "Failed to fetch data");
      }
    } catch (err) {
      setError(err.message);
      toast.error(`❌ ${err.message}`, { position: "top-right" });
    }
  };

  // Update the time conversion in export functions
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    };
  };

  // Add these export functions above the return statement
  const exportToPDF = () => {
    const doc = new jsPDF();
    const title = "Department Attendance Report";
    const headers = [["Roll No", "Name", "Department", "Date", "Time", "Status"]];
    const data = reportData.map(record => {
      const { date, time } = formatDateTime(record.ist_date);
      return [record.roll_no, record.name, record.department, date, time, record.status];
    });
  
    doc.text(title, 14, 15);
    autoTable(doc, {
      head: headers,
      body: data,
      startY: 25,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] } // Indigo color
    });
    doc.save(`department-report-${Date.now()}.pdf`);
  };
  
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData.map(record => {
      const { date, time } = formatDateTime(record.ist_date);
      return {
        "Roll No": record.roll_no,
        "Name": record.name,
        "Department": record.department,
        "Date": date,
        "Time": time,
        "Status": record.status
      };
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `department-report-${Date.now()}.xlsx`);
  };
  
  // In the JSX return statement, update the export buttons section to:
  {reportData.length > 0 && (
    <div className="flex gap-3">
      <button
        onClick={exportToPDF}
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export PDF
      </button>
      <button
        onClick={exportToExcel}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Excel
      </button>
    </div>
  )}
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-indigo-900">Department Analytics</h1>
              {reportData.length > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={exportToPDF}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export PDF
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 items-end">
              {/* Department Dropdown */}
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Batch Dropdown */}
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Batch</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}

                  required
                  className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  min={startDate} // Prevent selecting end date before start date
                  
                  required
                  className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center space-x-2 group"
              >
                <span>Generate</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </form>

            {reportData.length > 0 && (
              <div className="mt-8">
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full min-w-max">
                    <thead className="bg-indigo-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">Roll No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.map((record, index) => {
                        const { date, time } = formatDateTime(record.ist_date);
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4">{record.roll_no}</td>
                            <td className="px-6 py-4">{record.name}</td>
                            <td className="px-6 py-4">{record.department}</td>
                            <td className="px-6 py-4">{date}</td>
                            <td className="px-6 py-4">{time}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                record.status === 'Late' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* Display message if no data and no error */}
            {reportData.length === 0 && !error && (
              <div className="mt-8 text-center text-gray-500">
                <p>Select criteria and click 'Generate' to view the report.</p>
              </div>
            )}
            {/* Display error message */}
            {error && (
              <div className="mt-8 text-center text-red-600 bg-red-50 p-4 rounded-lg">
                <p>Error: {error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer limit={1} />
    </div>
  );
};

export default DepartmentReport;
