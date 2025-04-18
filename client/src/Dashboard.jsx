import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [timeRange, setTimeRange] = useState('weekly'); // 'weekly' or 'monthly'
  const [chartData, setChartData] = useState([]);
  const [refresh, setRefresh] = useState(false);

  // Sample data generator for demonstration
  const generateSampleData = (range) => {
    const data = [];
    if (range === 'weekly') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      days.forEach(day => {
        const entry = {
          name: day,
          CSE: Math.floor(Math.random() * 10),
          ECE: Math.floor(Math.random() * 8),
          EEE: Math.floor(Math.random() * 7),
          MECH: Math.floor(Math.random() * 9),
          CIVIL: Math.floor(Math.random() * 6),
          'AI&DS': Math.floor(Math.random() * 5),
        };
        data.push(entry);
      });
    } else {
      // Monthly data
      for (let i = 1; i <= 4; i++) {
        const entry = {
          name: `Week ${i}`,
          CSE: Math.floor(Math.random() * 40),
          ECE: Math.floor(Math.random() * 35),
          EEE: Math.floor(Math.random() * 30),
          MECH: Math.floor(Math.random() * 38),
          CIVIL: Math.floor(Math.random() * 25),
          'AI&DS': Math.floor(Math.random() * 20),
        };
        data.push(entry);
      }
    }
    return data;
  };

  const fetchDepartmentCounts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/attendance/department-counts`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      const allDepartments = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "AI&DS"].map(dept => ({
        name: dept,
        count: data.find(entry => entry.department === dept)?.count || 0,
      }));

      setDepartments(allDepartments);
      
      // Generate or fetch chart data based on time range
      setChartData(generateSampleData(timeRange));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchDepartmentCounts();
  }, [refresh, timeRange]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-800">
              Late Arrival Analytics
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setTimeRange('weekly')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  timeRange === 'weekly'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeRange('monthly')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  timeRange === 'monthly'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setRefresh(prev => !prev)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
              >
                Refresh Data
              </button>
            </div>
          </div>

          {/* Department Cards */}
          <div className="grid grid-cols-6 gap-4 mb-8">
            {departments.map((dept, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="text-lg font-semibold text-indigo-600 mb-2">
                  {dept.name}
                </div>
                <div className="text-3xl font-bold text-gray-800">
                  {dept.count}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="space-y-8">
            {/* Bar Chart */}
            <div className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Department-wise Late Arrivals
              </h3>
              <BarChart
                width={1000}
                height={300}
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
            </div>

            {/* Line Chart */}
            <div className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Trend Analysis
              </h3>
              <LineChart
                width={1000}
                height={300}
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
