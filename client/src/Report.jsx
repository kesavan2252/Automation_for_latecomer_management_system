import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

const Report = () => {
  const navigate = useNavigate();

  const reportOptions = [
    {
      title: "Student Report",
      description: "Generate reports for individual students",
      path: "/reports/student",
    },
    {
      title: "Department Report",
      description: "Generate reports by department",
      path: "/reports/department",
    }
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-indigo-900 mb-8">Reports Dashboard</h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            {reportOptions.map((option, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => navigate(option.path)}
              >
                <h2 className="text-xl font-semibold text-indigo-900 mb-2">{option.title}</h2>
                <p className="text-gray-600">{option.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;