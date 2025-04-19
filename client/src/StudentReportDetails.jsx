import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Sidebar from "./components/Sidebar";


const StudentReportDetails = () => {
  const location = useLocation();
  const { rollNo, startDate, endDate } = location.state || {};
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Keep only one formatDate function at the top level
 

  useEffect(() => {
    const fetchAttendanceReport = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/attendance/report/details`,
          {
            params: { roll_no: rollNo, start_date: startDate, end_date: endDate },
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        setStudent(response.data.student);
        setAttendance(response.data.attendance);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    if (rollNo && startDate && endDate) {
      fetchAttendanceReport();
    }
  }, [rollNo, startDate, endDate]);

  const handleBack = () => {
    navigate("/reports/student");
  };

  const toggleExport = () => {
    setIsExportOpen(!isExportOpen);
  };

  // Modified date formatter to exclude time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
    } text-white transform transition-all duration-500 translate-y-0 opacity-100`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('translate-y-[-1rem]', 'opacity-0');
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 3000);
  };

  const exportToExcel = () => {
    const data = [
      ["Roll No", student.roll_no, "From Date", formatDate(startDate)],
      ["Name", student.name, "To Date", formatDate(endDate)],
      ["Department", student.department],
      [],
      ["Date", "Status"],
      ...attendance.map((row) => [formatDate(row.date), row.status]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(wb, `Attendance_Report_${rollNo}.xlsx`);
    showNotification("Report exported to Excel successfully!", "success");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Student Attendance Report", 20, 10);

    doc.setFontSize(12);
    doc.text(`Roll No: ${student.roll_no}`, 20, 20);
    doc.text(`Name: ${student.name}`, 20, 30);
    doc.text(`Department: ${student.department}`, 20, 40);
    doc.text(`From: ${formatDate(startDate)}`, 20, 50);
    doc.text(`To: ${formatDate(endDate)}`, 20, 60);

    autoTable(doc, {
      startY: 70,
      head: [["Date", "Status"]],
      body: attendance.map((row) => [formatDate(row.date), row.status]),
    });

    doc.save(`Attendance_Report_${student.roll_no}.pdf`);
    showNotification("Report exported to PDF successfully!", "success");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={handleBack}
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <span className="text-xl">←</span>
              <span className="ml-2">Back to Search</span>
            </button>

            <div className="relative">
              <button
                onClick={toggleExport}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                Export Report
                <span className="ml-2">▼</span>
              </button>
              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-indigo-100 overflow-hidden z-50">
                  <button
                    onClick={exportToPDF}
                    className="w-full px-4 py-3 text-left hover:bg-indigo-50 text-indigo-900 flex items-center"
                  >
                    <span>Export as PDF</span>
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full px-4 py-3 text-left hover:bg-indigo-50 text-indigo-900 flex items-center"
                  >
                    <span>Export as Excel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {student && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-500">Student Details</h3>
                      <div className="mt-2 space-y-2">
                        <p className="text-indigo-900"><strong>Roll No:</strong> {student.roll_no}</p>
                        <p className="text-indigo-900"><strong>Name:</strong> {student.name}</p>
                        <p className="text-indigo-900"><strong>Department:</strong> {student.department}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Report Period</h3>
                      <div className="mt-2 space-y-2">
                        <p className="text-indigo-900"><strong>From:</strong> {formatDate(startDate)}</p>
                        <p className="text-indigo-900"><strong>To:</strong> {formatDate(endDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {attendance.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn">
                  <table className="w-full">
                    <thead className="bg-indigo-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-indigo-900">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-indigo-900">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-100">
                      {attendance.map((entry, index) => (
                        <tr key={index} className="hover:bg-indigo-50">
                          <td className="px-6 py-4 text-sm text-indigo-900">{formatDate(entry.date)}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              entry.status === 'Late' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center animate-fadeIn">
                  <p className="text-gray-500">No attendance records found for the selected period.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentReportDetails;
