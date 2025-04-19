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
    
    // Roll number validation
   

    if (startDate > endDate) {
      showNotification("Start date cannot be after end date!", "error");
      return;
    }
    navigate("/reports/student/details", { state: { rollNo, startDate, endDate } });
  };

  // Add real-time validation
  const handleRollNoChange = (e) => {
    const value = e.target.value.toUpperCase();
    setRollNo(value);
  };

  // In the return JSX, update the roll number input
  <input
    type="text"
    value={rollNo}
    onChange={handleRollNoChange}
    required
    placeholder="Enter roll number (e.g., 21IT045)"
    className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    maxLength={7}
  />

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8 space-x-4">
            <h1 className="text-2xl font-bold text-indigo-900">Student Analytics</h1>
            <svg className="w-8 h-8 text-indigo-600 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-indigo-900 mb-2">Roll Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={rollNo}
                    onChange={handleRollNoChange}
                    required
                    placeholder="Enter roll number "
                    className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent pl-10"
                    
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
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
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center space-x-2 group"
              >
                <span>Generate Report</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReport;
