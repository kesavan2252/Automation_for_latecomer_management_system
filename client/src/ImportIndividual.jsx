import { useState } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import { motion } from "framer-motion"; // Add this import

const ImportIndividual = () => {
  const [rollNo, setRollNo] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [batch, setBatch] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [authError, setAuthError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(false);  // Reset auth error state
  
    const token = localStorage.getItem("token");
    if (!token) {
      setPopupMessage("Please login again to continue");
      setIsError(true);
      setAuthError(true);
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate("/");  // Redirect to login page
      }, 3000);
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Retrieve stored token
      console.log("Retrieved Token:", token); // Debugging statement
      console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);
      console.log("Full API URL:", `${import.meta.env.VITE_API_BASE_URL}/api/students`);

      if (!token) {
        console.error("No token found. User is not authenticated.");
        return;
      }
      
  
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/students`,
        { rollNo, name, department, batch },
        {
          headers: {
            Authorization: `Bearer ${token}`,  //Ensure token is sent
            "Content-Type": "application/json",
            
          },
        }
      );
      
  
      console.log("Data submitted successfully:", response.data);
  
      // ✅ Show success message
      setPopupMessage("Student added successfully!");
      setIsError(false);
      setShowPopup(true);
  
      // Auto-hide popup after 3 seconds
      setTimeout(() => setShowPopup(false), 3000);
  
    } catch (error) {
      console.error("Error submitting data:", error.response ? error.response.data : error.message);
  
      if (error.response?.status === 401) {
        setPopupMessage("Session expired. Please login again.");
        setIsError(true);
        setAuthError(true);
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          navigate("/");
        }, 3000);
      } else if (error.response?.status === 400 && error.response.data.message === "Roll No already exists") {
        setPopupMessage("⚠️ Roll No already exists! Please enter a unique Roll No.");
        setIsError(true);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      } else {
        setPopupMessage("Something went wrong. Please try again.");
        setIsError(true);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      }
    }
  
    // Reset form
    setRollNo("");
    setName("");
    setDepartment("");
    setBatch("");
  };
  


  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 p-6"
      >
        <div className="max-w-2xl mx-auto">
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100"
          >
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold text-indigo-900 text-center mb-2"
            >
              Students Details Entry
            </motion.h1>
            <p className="text-blue-600 text-center mb-8 text-sm">
              Enter individual student information
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div 
                initial={{ x: -50 }}
                animate={{ x: 0 }}
                className="space-y-4"
              >
                <div className="group">
                  <label className="block text-indigo-700 font-medium mb-2">Roll No</label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    required
                    className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-lg 
                             text-indigo-900 focus:outline-none focus:ring-2 focus:ring-blue-400 
                             focus:border-transparent transition-all duration-300
                             group-hover:bg-blue-50"
                  />
                </div>

                <div className="group">
                  <label className="block text-indigo-700 font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-lg 
                             text-indigo-900 focus:outline-none focus:ring-2 focus:ring-blue-400 
                             focus:border-transparent transition-all duration-300
                             group-hover:bg-blue-50"
                  />
                </div>

                <div className="group">
                  <label className="block text-indigo-700 font-medium mb-2">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-lg 
                             text-indigo-900 focus:outline-none focus:ring-2 focus:ring-blue-400 
                             focus:border-transparent transition-all duration-300
                             group-hover:bg-blue-50"
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="MECH">MECH</option>
                    <option value="AIDS">AIDS</option>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-indigo-700 font-medium mb-2">Batch</label>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    required
                    className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-lg 
                             text-indigo-900 focus:outline-none focus:ring-2 focus:ring-blue-400 
                             focus:border-transparent transition-all duration-300
                             group-hover:bg-blue-50"
                  >
                    <option value="">Select Batch</option>
                    <option value="2021-2025">2021-2025</option>
                    <option value="2022-2026">2022-2026</option>
                    <option value="2023-2027">2023-2027</option>
                    <option value="2024-2028">2024-2028</option>
                    <option value="2025-2029">2025-2029</option>
                  </select>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 
                         hover:to-blue-600 text-white font-medium py-3 rounded-lg transition-all 
                         duration-300 shadow-md hover:shadow-lg"
              >
                Add Student
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Enhanced Animated Popup */}
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-5 right-5 px-6 py-3 rounded-lg shadow-lg ${
              authError 
                ? "bg-orange-500" 
                : isError 
                  ? "bg-red-500" 
                  : "bg-green-500"
            } text-white font-medium flex items-center space-x-2`}
          >
            <span>
              {authError 
                ? "🔒" 
                : isError 
                  ? "⚠️" 
                  : "✅"}
            </span>
            <span>{popupMessage}</span>
          </motion.div>
        )}

        {/* Authentication Warning */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-5 right-5 bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded shadow-lg"
          >
            <p className="font-bold">Authentication Required</p>
            <p>You will be redirected to the login page...</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ImportIndividual;
