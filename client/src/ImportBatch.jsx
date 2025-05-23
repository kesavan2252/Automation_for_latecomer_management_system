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
  const [totalRecords, setTotalRecords] = useState(0);
  const [parsedData, setParsedData] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileError("");
    setParsedData(null);
    
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setFileError("Please upload only CSV files!");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 0) {
          const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
          if (!headers.includes('roll_no') || !headers.includes('name') || !headers.includes('department')) {
            setFileError("File must contain roll_no, name, and department columns!");
            return;
          }

          // Parse CSV data into structured format
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            return {
              roll_no: values[headers.indexOf('roll_no')],
              name: values[headers.indexOf('name')],
              department: values[headers.indexOf('department')],
              batch: batch // Add batch information
            };
          }).filter(item => item.roll_no && item.name && item.department); // Filter out invalid rows

          setTotalRecords(data.length);
          setParsedData(data);
          setFilePreview(lines.slice(0, 6));
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
        <div className="max-w-6xl mx-auto">
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
            <p className="text-blue-600 text-center mb-4 text-sm">
              Upload multiple student records using CSV file
            </p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-indigo-700 font-medium mb-2">Select Batch</label>
                    <select
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      required
                      className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-lg 
                               text-indigo-900 focus:outline-none focus:ring-2 focus:ring-blue-400 
                               focus:border-transparent transition-all duration-300"
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
                </div>
              </div>

              {/* Preview Section */}
              {parsedData && (
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900 mb-4">
                    Preview for Batch: {batch}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                      <thead className="bg-indigo-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                            Roll No
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                            Batch
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {parsedData.slice(0, 5).map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {row.roll_no}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {row.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {row.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {batch}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-blue-600">
                      Showing 5 of {totalRecords} records
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={!parsedData || !batch}
                      className={`px-6 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg
                                ${(!parsedData || !batch) 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                    >
                      Import {totalRecords} Students to Batch {batch}
                    </motion.button>
                  </div>
                </div>
              )}
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