import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ScannerPage = () => {
    const navigate = useNavigate();
    const [scannedData, setScannedData] = useState(null);
    const [manualRollNo, setManualRollNo] = useState("");
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [hardwareStatus, setHardwareStatus] = useState("Checking...");
    const [currentTime, setCurrentTime] = useState(new Date());
    const inputRef = useRef(null);

    // Function to check hardware connection
    const checkHardware = async () => {
        if (`serial` in navigator) {
            try {
                const ports = await navigator.serial.getPorts();
                if (ports.length > 0) {
                    setHardwareStatus("Hardware Active");
                } else {
                    setHardwareStatus("Hardware Inactive");
                }
            } catch (error) {
                console.error("Error checking hardware:", error);
                setHardwareStatus("Hardware Inactive");
            }
        } else {
            setHardwareStatus("Serial API Not Supported");
        }
    };

    useEffect(() => {
        checkHardware();
        const interval = setInterval(() => {
            checkHardware();
        }, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, []);

    // Update timer every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: "", type: "" }), 3000);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
        showNotification("Logged out successfully!", "info");
    };

    const [scannerStatus, setScannerStatus] = useState("Waiting for scan...");
    const [lastScanTime, setLastScanTime] = useState(null);

    // Keep only this single fetchAttendance function


    // Single time update effect
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            setCurrentTime(istTime);
        };
        
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Remove duplicate useEffect for hardware check
    useEffect(() => {
        checkHardware();
        const interval = setInterval(() => {
            checkHardware();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Keep only one time update effect
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            setCurrentTime(istTime);
        };
        
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Keep only one keyboard event handler
    useEffect(() => {
        const handleKeyPress = async (event) => {
            if (event.key === "Enter" && manualRollNo) {
                await fetchAttendance(manualRollNo);
            }
        };

        document.addEventListener("keydown", handleKeyPress);
        return () => document.removeEventListener("keydown", handleKeyPress);
    }, [manualRollNo]);

    // Keep only one fetchAttendance function
    const fetchAttendance = async (rollNo) => {
        try {
            setScannerStatus("Processing scan...");
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/attendance/mark-attendance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roll_no: rollNo }),
            });

            const data = await response.json();
            if (!response.ok) {
                setScannerStatus("Scan failed");
                showNotification(data.error || "Failed to mark attendance.", "error");
                return;
            }

            if (data.record) {
                const istTime = new Date(data.record.date);
                const formattedTime = istTime.toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });

                setScannedData({
                    roll_no: data.record.roll_no,
                    name: data.record.name ? data.record.name.trim() : "N/A",
                    department: data.record.department || "Unknown",
                    date: formattedTime,
                    status: data.record.status,
                });
                setLastScanTime(new Date());
                setScannerStatus("Scan successful");
            }

            showNotification(data.message, "success");
            checkHardware();
            setManualRollNo("");
            inputRef.current?.focus();
        } catch (error) {
            console.error("Error:", error);
            setScannerStatus("Scan error");
            showNotification("Server Error. Please try again.", "error");
        } finally {
            setTimeout(() => {
                setScannerStatus("Waiting for scan...");
            }, 2000);
        }
    };

    // Keep handleManualEntry function
    const handleManualEntry = async () => {
        if (!manualRollNo) {
            showNotification("Please enter a Roll Number!", "warning");
            return;
        }
        await fetchAttendance(manualRollNo);
    };

    // Add keyboard event handler for scanner and manual input
    useEffect(() => {
        const handleKeyPress = async (event) => {
            if (event.key === "Enter") {
                if (manualRollNo) {
                    await fetchAttendance(manualRollNo);
                }
            }
        };

        document.addEventListener("keydown", handleKeyPress);
        return () => document.removeEventListener("keydown", handleKeyPress);
    }, [manualRollNo]);

    // Add this in your return JSX, inside the scanner status div
    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-violet-900">
            {/* Notification styling */}
            {notification.message && (
                <div className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg text-white 
                    ${notification.type === "success" ? "bg-emerald-500" 
                    : notification.type === "error" ? "bg-rose-500" 
                    : notification.type === "info" ? "bg-cyan-500" 
                    : "bg-amber-500"}`}>
                    {notification.message}
                </div>
            )}

            {/* Header section */}
            <div className="bg-indigo-800/30 backdrop-blur-sm text-white px-8 py-4 shadow-lg">
                <div className="container mx-auto flex justify-between items-center">
                    <a href="https://solamalaice.ac.in/" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-2xl font-bold hover:text-indigo-200 transition-colors">
                        Solamalai College of Engineering
                    </a>
                    {/* Update the time display in header */}
                    <div className="flex items-center gap-6">
                        <div className="text-xl font-digital bg-indigo-700/50 px-4 py-2 rounded-lg border border-indigo-400/30">
                            {currentTime.toLocaleString('en-IN', {
                                timeZone: 'Asia/Kolkata',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
                            })}
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-lg transition-colors">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-white mb-8 drop-shadow-lg">
                        {/* Greeting remains the same */}
                    </h2>

                    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8">
                        {/* Scanner Status Section */}
                        <div className="text-center mb-6">
                            <div className={`text-xl font-bold mb-2 ${
                                hardwareStatus === "Hardware Active" ? "text-emerald-500" : "text-rose-500"
                            }`}>
                                {hardwareStatus}
                            </div>
                            <div className={`text-sm font-medium ${
                                scannerStatus === "Scan successful" ? "text-emerald-500" :
                                scannerStatus === "Scan failed" ? "text-rose-500" :
                                scannerStatus === "Processing scan..." ? "text-cyan-500" :
                                "text-slate-500"
                            }`}>
                                {scannerStatus}
                            </div>
                        </div>

                        {/* Scanner Input Section */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-indigo-800 mb-2">ID Scanner</h3>
                                <p className="text-slate-600">Show your ID Card to the scanner or enter Roll Number manually.</p>
                            </div>

                            {/* Manual Entry */}
                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                <p className="text-lg font-semibold text-slate-700 mb-3">Manual Entry</p>
                                <input
                                    type="text"
                                    placeholder="Enter Roll Number"
                                    value={manualRollNo}
                                    onChange={(e) => setManualRollNo(e.target.value)}
                                    ref={inputRef}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleManualEntry}
                                    className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors">
                                    Submit
                                </button>
                            </div>

                            {/* Scanned Details */}
                            {scannedData && (
                                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                                    <h4 className="text-lg font-bold text-indigo-800 mb-4">Scanned Details</h4>
                                    <div className="space-y-2">
                                        <p><span className="font-semibold">Roll Number:</span> {scannedData.roll_no}</p>
                                        <p><span className="font-semibold">Name:</span> {scannedData.name}</p>
                                        <p><span className="font-semibold">Department:</span> {scannedData.department}</p>
                                        <p><span className="font-semibold">Time:</span> {scannedData.date}</p>
                                        <p>
                                            <span className="font-semibold">Status:</span>
                                            <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                                                scannedData.status === "On-Time" 
                                                    ? "bg-emerald-100 text-emerald-800" 
                                                    : "bg-amber-100 text-amber-800"
                                            }`}>
                                                {scannedData.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScannerPage;
