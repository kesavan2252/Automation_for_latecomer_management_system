import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Sidebar";
import { motion } from "framer-motion";

const ImportBatch = () => {
  const [batch, setBatch] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileError("");
    
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setFileError("Please upload only CSV files!");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== ''); // Filter empty lines
        if (lines.length > 0) {
          const headers = lines[0].toLowerCase();
          if (!headers.includes('roll_no') || !headers.includes('name') || !headers.includes('department')) {
            setFileError("File must contain roll_no, name, and department columns!");
            return;
          }
          setFilePreview(lines.slice(0, 6)); // Preview first 5 rows + header
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!file || !batch) {
      toast.error("Please select a batch and upload a file!", { position: "top-right" });
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("batch", batch);
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/students/import`,
        {
          method: "POST",
          body: formData,
        }
      );
  
      const contentType = response.headers.get("content-type");
  
      let result;
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text(); // To inspect raw response (HTML, etc.)
        console.error("Unexpected non-JSON response:", text);
        throw new Error("Unexpected response from server. Please check the backend.");
      }
  
      if (!response.ok) {
        throw new Error(result.message || "File upload failed");
      }
  
      toast.success("File uploaded successfully!", { position: "top-right" });
  
      // Show warning if duplicate records exist
      if (result.skipped && result.skipped.length > 0) {
        toast.warn(
          `Skipped ${result.skipped.length} duplicate entries! (${result.skipped.join(", ")})`,
          { position: "top-right", autoClose: 4000 }
        );
      }
  
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(error.message || "Error uploading file!", { position: "top-right" });
    }
  };
  

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 p-6"
      >
        <div className="max-w-4xl mx-auto">
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
              Batch Import Students
            </motion.h1>
            <p className="text-blue-600 text-center mb-8 text-sm">
              Upload multiple student records using CSV file
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Form Section */}
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-indigo-700 font-medium mb-2">Select Batch</label>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    required
                    className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-lg 
                             text-indigo-900 focus:outline-none focus:ring-2 focus:ring-blue-400 
                             focus:border-transparent transition-all duration-300
                             group-hover:bg-blue-50"
                  >
                    <option value="">Choose batch year</option>
                    <option value="2021-2025">2021-2025</option>
                    <option value="2022-2026">2022-2026</option>
                    <option value="2023-2027">2023-2027</option>
                    <option value="2024-2028">2024-2028</option>
                    <option value="2025-2029">2025-2029</option>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-indigo-700 font-medium mb-2">Upload CSV File</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      required
                      className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-lg 
                               text-indigo-900 focus:outline-none focus:ring-2 focus:ring-blue-400 
                               file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                               file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                               hover:file:bg-blue-100 transition-all duration-300"
                    />
                  </div>
                  {fileError && (
                    <p className="text-red-500 text-sm mt-2">{fileError}</p>
                  )}
                  <p className="text-sm text-blue-600 mt-2">
                    File must contain: <span className="font-semibold">roll_no, name, department</span>
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 
                           hover:to-blue-600 text-white font-medium py-3 rounded-lg transition-all 
                           duration-300 shadow-md hover:shadow-lg"
                >
                  Import Students
                </motion.button>
              </div>

              {/* Preview Section */}
              <div className="bg-gray-50 rounded-lg p-4 border border-blue-100">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4">File Preview</h3>
                {filePreview ? (
                  <div className="space-y-2">
                    {filePreview.map((line, index) => (
                      <div 
                        key={index}
                        className={`text-sm font-mono p-2 rounded ${
                          index === 0 
                            ? 'bg-blue-100 text-blue-800 font-semibold' 
                            : 'bg-white text-gray-600'
                        }`}
                      >
                        {line}
                      </div>
                    ))}
                    <p className="text-sm text-blue-600 mt-4">
                      {filePreview.length > 0 && `Showing ${filePreview.length - 1} records preview of total ${
                        file?.text?.split('\n').filter(line => line.trim() !== '').length - 1 || '?'
                      } records`}
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>No file selected</p>
                    <p className="text-sm">CSV preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="colored"
        className="mt-16"
      />
    </div>
  );
};

export default ImportBatch;
