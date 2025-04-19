import { useState } from "react";
import Sidebar from "./components/Sidebar"; 
import { useNavigate } from "react-router-dom";

const StudentReport = () => {
  const [rollNo, setRollNo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  // Get current date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate > today) {
      alert("Start date cannot be in the future!");
      return;
    }
    setStartDate(selectedDate);
  };

  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate > today) {
      alert("End date cannot be in the future!");
      return;
    }
    setEndDate(selectedDate);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (startDate > endDate) {
      showNotification("Start date cannot be after end date!", "error");
      return;
    }
    navigate("/reports/student/details", { state: { rollNo, startDate, endDate } });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-indigo-900 mb-8">Student Analytics</h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-2">Roll Number</label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter roll number"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-2">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    max={today}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-2">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    max={today}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center space-x-2"
              >
                <span>Generate Report</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReport;
