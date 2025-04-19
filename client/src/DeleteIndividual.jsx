import { useState } from "react";
import Sidebar from "./components/Sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeleteStudent = () => {
  const [rollNo, setRollNo] = useState("");
  const [batch, setBatch] = useState("");
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async () => {
    if (!rollNo.trim() || !batch) {
      toast.warn("Please enter Roll Number and select a Batch", {
        position: "top-right"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/students/${rollNo}/${batch}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Student not found");
      }

      const fetchedStudent = await response.json();
      setStudent(fetchedStudent);
      toast.success("Student record found!", { position: "top-right" });
    } catch (error) {
      toast.error("Student not found. Check Roll No and Batch.", {
        position: "top-right"
      });
      setStudent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => setShowConfirmation(true);

  const confirmDelete = async (choice) => {
      if (choice === "no") {
        setShowConfirmation(false);
        return;
      }
  
      setIsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/students/${student.roll_no}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
          }
        );
  
        if (!response.ok) {
          throw new Error("Failed to delete student");
        }
  
        toast.success("Student deleted successfully!", { position: "top-right" });
        setStudent(null);
        setRollNo("");
        setBatch("");
      } catch (error) {
        toast.error("Failed to delete student. Please try again.", {
          position: "top-right"
        });
      } finally {
        setIsLoading(false);
        setShowConfirmation(false);
      }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-indigo-100">
            <h1 className="text-2xl font-bold text-indigo-900 mb-8 flex items-center gap-3">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Student Record
            </h1>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-2">Roll Number</label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                  placeholder="Enter Roll Number"
                  className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-2">Academic Batch</label>
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                >
                  <option value="">Select Batch</option>
                  {Array.from({length: 5}, (_, i) => {
                    const year = 2021 + i;
                    return (
                      <option key={year} value={`${year}-${year + 4}`}>
                        {year} - {year + 4}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Student
                </>
              )}
            </button>

            {student && (
              <div className="mt-8 bg-red-50 rounded-xl p-6 border border-red-100">
                <h2 className="text-lg font-semibold text-red-900 mb-4">Student Details</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-red-200">
                    <p className="text-sm text-red-700 mb-1">Roll Number</p>
                    <p className="font-medium text-red-900">{student.roll_no}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-red-200">
                    <p className="text-sm text-red-700 mb-1">Name</p>
                    <p className="font-medium text-red-900">{student.name}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-red-200">
                    <p className="text-sm text-red-700 mb-1">Department</p>
                    <p className="font-medium text-red-900">{student.department}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-red-200">
                    <p className="text-sm text-red-700 mb-1">Batch</p>
                    <p className="font-medium text-red-900">{student.batch}</p>
                  </div>
                </div>

                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="mt-6 w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Student Record
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl animate-slideUp">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
              <p className="text-gray-500 mt-2">Are you sure you want to delete this student record? This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => confirmDelete("no")}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete("yes")}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default DeleteStudent;
