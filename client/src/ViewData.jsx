import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

const ViewData = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");

  const validateDates = (start, end) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of current day
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate > today || endDate > today) {
      setDateError("Future dates are not allowed");
      return false;
    }
    if (startDate > endDate) {
      setDateError("Start date cannot be after end date");
      return false;
    }
    setDateError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateDates(startDate, endDate)) {
      navigate("/view-data/results", {
        state: { startDate, endDate },
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
            <h1 className="text-2xl font-bold text-blue-900 text-center mb-2">
              View Attendance Data
            </h1>
            <p className="text-blue-600 text-center mb-8">
              Select a date range to view attendance records
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-blue-700 font-medium">
                    Start Date
                  </label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-lg 
                             text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 
                             focus:border-transparent"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-blue-700 font-medium">
                    End Date
                  </label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-lg 
                             text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 
                             focus:border-transparent"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {dateError && (
                <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
                  {dateError}
                </p>
              )}

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white 
                           rounded-lg transition-all duration-200 font-medium 
                           shadow-md hover:shadow-lg"
                >
                  View Records
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewData;
