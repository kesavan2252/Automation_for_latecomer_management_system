import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditStudents = () => {
  const [rollNo, setRollNo] = useState("");
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Validate roll number format
  // Update the validation function
  const validateRollNo = (number) => /^\d{12}$/i.test(number);
  
  // Update the input field
  <input
      type="text"
      value={rollNo}
      onChange={(e) => {
          const value = e.target.value.replace(/\D/g, ''); // Only allow digits
          if (value.length <= 12) setRollNo(value);
      }}
      placeholder="Enter 12-digit Roll Number"
      maxLength={12}
      className="w-full px-6 py-4 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
  />

  const handleSearch = async () => {
    if (!rollNo.trim()) {
      toast.warn("Please enter a Roll Number", { position: "top-right" });
      return;
    }
    
    if (!validateRollNo(rollNo)) {
      toast.error("Invalid Roll Number format (e.g: 21IT045)", { position: "top-right" });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/students/${rollNo.toUpperCase()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Student not found");
      }

      const data = await response.json();
      setStudent(data);
      toast.success("Student record found!", { position: "top-right" });
    } catch (error) {
      toast.error(error.message, { position: "top-right" });
      setStudent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!student?.name || !student.department || !student.batch) {
      toast.warn("All fields are required", { position: "top-right" });
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/students/${student.roll_no}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(student),
      });

      if (!response.ok) throw new Error("Update failed");
      
      toast.success("Student updated successfully!", { position: "top-right" });
      setTimeout(() => setStudent(null), 1500);
    } catch (error) {
      toast.error(error.message, { position: "top-right" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar />
      <div className="flex-1 p-8 ml-1">
        <div className="max-w-4xl mx-auto animate-fadeIn">
          <h1 className="text-3xl font-bold text-indigo-900 mb-8 flex items-center gap-3">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
            Student Record Editor
          </h1>

          {!student ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-indigo-100">
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                    placeholder="Enter Roll Number "
                    
                    className="w-full px-6 py-4 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <svg className="absolute right-4 top-4 w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>

                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.26 3 3 0 00-4.243 4.26z"/>
                      </svg>
                      Search Student
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-indigo-100 animate-slideUp">
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setStudent(null)}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Back to Search
                  </button>
                  <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium">
                    Editing: {student.roll_no}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-indigo-900 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={student.name}
                      onChange={(e) => setStudent({...student, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-indigo-900 mb-2">Department</label>
                    <select
                      value={student.department}
                      onChange={(e) => setStudent({...student, department: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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

                  <div>
                    <label className="block text-sm font-medium text-indigo-900 mb-2">Academic Batch</label>
                    <select
                      value={student.batch}
                      onChange={(e) => setStudent({...student, batch: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      {Array.from({length: 5}, (_, i) => 2021 + i).map(year => (
                        <option key={year} value={`${year}-${year + 4}`}>
                          {year} - {year + 4}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Update Student Record
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer limit={3} />
    </div>
  );
};

export default EditStudents;
