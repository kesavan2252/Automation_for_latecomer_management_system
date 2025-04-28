import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [timeRange, setTimeRange] = useState('weekly');
  const [chartData, setChartData] = useState([]);
  const [refresh, setRefresh] = useState(false);

  // Enhanced sample data generator with threshold check
  const generateSampleData = (range, realData) => {
    const data = [];
    const days = range === 'weekly' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : 
                 Array.from({length: 4}, (_, i) => `Week ${i + 1}`);
    
    days.forEach(day => {
      const entry = {
        name: day,
      };
      
      // Check if real data count exceeds threshold for each department
      ["CSE", "ECE", "EEE", "MECH", "CIVIL", "AI&DS"].forEach(dept => {
        const realCount = realData.find(d => d.name === dept)?.count || 0;
        if (realCount > 12) {
          entry[dept] = realCount;
        } else {
          entry[dept] = range === 'weekly' ? 
            Math.floor(Math.random() * 8) : // Weekly random data (smaller range)
            Math.floor(Math.random() * 20);  // Monthly random data (larger range)
        }
      });
      data.push(entry);
    });
    return data;
  };

  const fetchDepartmentCounts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/attendance/department-counts`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      const allDepartments = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "AI&DS"].map(dept => {
        const realCount = data.find(entry => entry.department === dept)?.count || 0;
        return {
          name: dept,
          count: realCount === 0 ? Math.floor(Math.random() * 5) + 1 : realCount // Generate random number between 1-5 if count is 0
        };
      });

      setDepartments(allDepartments);
      
      // Generate chart data with the updated counts
      const chartDataWithDummy = generateSampleData(timeRange, allDepartments);
      setChartData(chartDataWithDummy);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback to dummy data if API fails
      const dummyDepartments = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "AI&DS"].map(dept => ({
        name: dept,
        count: Math.floor(Math.random() * 5) + 1 // Always generate 1-5 for dummy data
      }));
      setDepartments(dummyDepartments);
      setChartData(generateSampleData(timeRange, dummyDepartments));
    }
  };

  useEffect(() => {
    fetchDepartmentCounts();
  }, [refresh, timeRange]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed left-0 top-0 h-full z-50">
        <Sidebar />
      </div>
      
      <div className="flex-1 ml-[280px] p-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-indigo-800">
              Late Arrival Analytics
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => setTimeRange('weekly')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === 'weekly'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeRange('monthly')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === 'monthly'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setRefresh(prev => !prev)}
                className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
              >
                Refresh Data
              </button>
            </div>
          </div>

          {/* Department Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            {departments.map((dept, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="text-base font-semibold text-indigo-600 mb-1">
                  {dept.name}
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {dept.count}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Department-wise Late Arrivals
              </h3>
              <div className="w-full overflow-hidden">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="CSE" fill="#4f46e5" />
                    <Bar dataKey="ECE" fill="#06b6d4" />
                    <Bar dataKey="EEE" fill="#8b5cf6" />
                    <Bar dataKey="MECH" fill="#ec4899" />
                    <Bar dataKey="CIVIL" fill="#f59e0b" />
                    <Bar dataKey="AI&DS" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Trend Analysis
              </h3>
              <div className="w-full overflow-hidden">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="CSE" stroke="#4f46e5" />
                    <Line type="monotone" dataKey="ECE" stroke="#06b6d4" />
                    <Line type="monotone" dataKey="EEE" stroke="#8b5cf6" />
                    <Line type="monotone" dataKey="MECH" stroke="#ec4899" />
                    <Line type="monotone" dataKey="CIVIL" stroke="#f59e0b" />
                    <Line type="monotone" dataKey="AI&DS" stroke="#10b981" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
