import { useState } from "react";
import Sidebar from "./components/Sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeleteBatch = () => {
  const [batch, setBatch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deletedCount, setDeletedCount] = useState(null);

  const handleDelete = () => {
    if (!batch) {
      toast.warn("Please select a Batch", { position: "top-right" });
      return;
    }
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/students/batch/${batch}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );     

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete batch");
      }

      setDeletedCount(data.deletedCount);
      toast.success(`✅ ${data.message}`, { position: "top-right" });
      setBatch("");
    } catch (error) {
      toast.error(`❌ ${error.message}`, { position: "top-right" });
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
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-indigo-900 flex items-center gap-3">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Batch Deletion Portal
              </h1>
              {deletedCount !== null && (
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                  Last deletion: {deletedCount} students removed
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-red-50 rounded-lg p-6 border border-red-100">
                <div className="flex items-center gap-3 text-red-700 mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-semibold text-lg">Warning</span>
                </div>
                <p className="text-red-600">
                  This action will permanently delete all student records from the selected batch across all departments. 
                  This operation cannot be undone and all associated data will be lost.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-indigo-100">
                <label className="block text-sm font-medium text-indigo-900 mb-2">Select Academic Batch</label>
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                >
                  <option value="">Choose a batch to delete</option>
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

              <button
                onClick={handleDelete}
                disabled={isLoading || !batch}
                className="w-full bg-red-600 text-white py-4 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Entire Batch
              </button>
            </div>
          </div>
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[480px] shadow-2xl animate-slideUp">
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Batch Deletion</h3>
              <p className="text-gray-600">
                Are you sure you want to delete all students from batch <span className="font-semibold">{batch}</span>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Delete Batch"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default DeleteBatch;
