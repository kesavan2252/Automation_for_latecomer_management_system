import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ScannerPage = () => {
    const navigate = useNavigate();
    const [scannedData, setScannedData] = useState(null);
    const [manualRollNo, setManualRollNo] = useState("");
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [lastScanTime, setLastScanTime] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            // Create date directly in IST timezone
            const istOptions = { timeZone: 'Asia/Kolkata' };
            const istTime = new Date(now.toLocaleString('en-US', istOptions));
            setCurrentTime(istTime);
        };
        
        updateTime();
        const interval = setInterval(updateTime, 1000);
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

    useEffect(() => {
        const handleKeyPress = async (event) => {
            if (event.key === "Enter" && manualRollNo.trim()) {
                event.preventDefault();
                if (lastScanTime && (new Date() - lastScanTime) < 2000) {
                    console.log("Scan too quick, ignoring...");
                    return;
                }
                await fetchAttendance(manualRollNo.trim());
                setManualRollNo("");
            }
        };

        document.addEventListener("keydown", handleKeyPress);
        return () => document.removeEventListener("keydown", handleKeyPress);
    }, [manualRollNo, lastScanTime]);

    const fetchAttendance = async (rollNo) => {
        if (!rollNo.trim()) return;
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/attendance/mark-attendance`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    roll_no: rollNo
                }),
            });
    
            const data = await response.json();
            if (!response.ok) {
                showNotification(data.error || "Failed to mark attendance.", "error");
                return;
            }
    
            if (data.record) {
                // Format the received date in IST
                const recordDate = new Date(data.record.date);
                const formattedDate = recordDate.toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }).replace(/(\d{2})\/(\d{2})\/(\d{4}),\s+(\d{1,2}):(\d{2})\s+(AM|PM)/, '$1/$2/$3, $4:$5 $6').toLowerCase();

                setScannedData({
                    roll_no: data.record.roll_no,
                    name: data.record.name ? data.record.name.trim() : "N/A",
                    department: data.record.department || "Unknown",
                    date: formattedDate,
                    status: data.record.status,
                });
                setLastScanTime(new Date());
            }
    
            showNotification(data.message, "success");
            setManualRollNo("");
            inputRef.current?.focus();
        } catch (error) {
            console.error("Error:", error);
            showNotification("Server Error. Please try again.", "error");
        }
    };

    const handleManualEntry = async () => {
        if (!manualRollNo) {
            showNotification("Please enter a Roll Number!", "warning");
            return;
        }
        
        if (lastScanTime && (new Date() - lastScanTime) < 2000) {
            showNotification("Please wait before scanning again", "warning");
            return;
        }
        
        await fetchAttendance(manualRollNo);
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-600 via-cyan-700 to-amber-900 animate-gradient-x">
            {/* Notification styling */}
            {notification.message && (
                <div className={`fixed top-25 right-5 px-4 py-2 rounded-lg shadow-xl text-white font-semibold
                    transform transition-all duration-300 ${notification.message ? 'translate-x-0' : 'translate-x-[150%]'}
                    ${notification.type === "success" ? "bg-gradient-to-r from-emerald-400 to-teal-500" 
                    : notification.type === "error" ? "bg-gradient-to-r from-rose-400 to-pink-500" 
                    : notification.type === "info" ? "bg-gradient-to-r from-cyan-400 to-sky-500" 
                    : "bg-gradient-to-r from-amber-400 to-orange-500"}`}>
                    {notification.message}
                </div>
            )}

            {/* Header section */}
            <div className="bg-teal-800/40 backdrop-blur-lg border-b border-cyan-400/30 text-amber-100 px-8 py-4 shadow-2xl">
                <div className="container mx-auto flex justify-between items-center">
                    <a href="https://solamalaice.ac.in/" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-2xl font-bold hover:text-amber-300 transition-colors duration-300 hover:drop-shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                        Solamalai College of Engineering
                    </a>
                    <div className="flex items-center gap-6">
                        <div className="text-xl font-digital bg-amber-900/20 px-4 py-2 rounded-xl border border-amber-400/30 animate-pulse">
                            <span className="bg-gradient-to-r from-amber-400 to-teal-300 bg-clip-text text-transparent">
                                {currentTime.toLocaleString('en-IN', {
                                    timeZone: 'Asia/Kolkata',
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: true
                                })}
                            </span>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-gradient-to-br from-white/95 via-cyan-50/95 to-amber-50/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-cyan-200/30 hover:border-cyan-300/50 transition-all duration-500">


                        {/* Scanner Input Section */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-amber-600 bg-clip-text text-transparent mb-2">
                                    ID Scanner Interface
                                </h3>
                                <p className="text-slate-600 font-medium">Present ID Card or Enter Roll Number Below</p>
                            </div>

                            {/* Manual Entry */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200/60 hover:border-cyan-300/60 transition-all duration-300 group">
                                <p className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                                    </svg>
                                    Manual Entry
                                </p>
                                <input
                                    type="text"
                                    placeholder="Enter Roll Number"
                                    value={manualRollNo}
                                    onChange={(e) => setManualRollNo(e.target.value)}
                                    ref={inputRef}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent placeholder-slate-400 transition-all duration-300"
                                />
                                <button
                                    onClick={handleManualEntry}
                                    className="w-full mt-4 bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-600 hover:to-cyan-600 text-white py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                    </svg>
                                    Submit Entry
                                </button>
                            </div>

                            {/* Scanned Details */}
                            {scannedData && (
                                <div className="animate-scale-in bg-white p-6 rounded-xl border border-cyan-200/60">
                                    <h4 className="text-lg font-bold text-cyan-700 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        Scan Details
                                    </h4>
                                    <div className="space-y-3">
                                        {Object.entries(scannedData).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center border-b border-slate-100 pb-2">
                                                <span className="font-medium text-slate-600 capitalize">{key.replace('_', ' ')}:</span>
                                                <span className={`font-semibold ${
                                                    key === 'status' 
                                                        ? value === "On-Time" 
                                                            ? "text-emerald-500" 
                                                            : "text-amber-500"
                                                        : "text-cyan-600"
                                                }`}>
                                                    {value}
                                                </span>
                                            </div>
                                        ))}
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
