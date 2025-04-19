import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import image from "/img/image.png";
import icon from "/img/icon.jpg";  // Changed from '/assets' to '/img'

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Keep the handleLogin function unchanged
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        
         // ✅ Store the token in localStorage
         localStorage.setItem("token", data.token);  
         console.log("Token stored:", data.token); // Debugging
 
         
        if (username === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/scanner");
        }
      } else {
        toast.error("Invalid credentials!", { position: "top-right" }); // Show error notification
      }
    
    } catch (error) {
      toast.error("An error occurred. Please try again later.", { position: "top-right" }); // Show error notification
    }
  }; // Add missing closing brace here

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
         style={{ backgroundImage: `url(${image})` }}>
      {/* Light overlay */}
      <div className="absolute inset-0 bg-sky-100/20 backdrop-blur-[3px]"></div>
      
      <ToastContainer className="mt-16" />

      <form 
        onSubmit={handleLogin}
        className="relative z-10 flex flex-col items-center p-10 rounded-3xl
                 bg-white/30 backdrop-blur-lg border-2 border-sky-200
                 shadow-[0_8px_40px_0_rgba(125,211,252,0.15)]
                 w-full max-w-md mx-4 space-y-8">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="p-5 bg-sky-100 rounded-2xl border-2 border-sky-200 shadow-sm">
            <div className="w-16 h-16 bg-sky-500 rounded-xl flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" 
                      d="M12 6v6l4 2m4-2a10 10 0 11-20 0 10 10 0 0120 0z"/>
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-sky-900 text-center">
            Late Comer Management System
          </h2>
        </div>

        {/* Form Elements */}
        <div className="w-full space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold text-sky-900">Welcome Back</h3>
            <p className="text-sky-600/90">Sign in to continue</p>
          </div>

          {/* Username Input */}
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-6 py-4 text-sky-900 bg-white/50 rounded-xl
                       border-2 border-sky-200 placeholder-sky-400
                       focus:border-sky-500 focus:ring-2 focus:ring-sky-100
                       transition-all outline-none text-lg"
              required
            />
            <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-sky-500" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
            </svg>
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-6 py-4 text-sky-900 bg-white/50 rounded-xl
                       border-2 border-sky-200 placeholder-sky-400
                       focus:border-sky-500 focus:ring-2 focus:ring-sky-100
                       transition-all outline-none text-lg"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-sky-500 hover:text-sky-600"
            >
              {showPassword ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M18.637 13.773A10.046 10.046 0 0121 12c-1.274 4.057-5.065 7-9.542 7-1.125 0-2.205-.18-3.222-.511m-2.15 2.375L3 20.5M4.5 4.5l15 15"/>
                </svg>
              )}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-4 bg-sky-500 text-white font-semibold rounded-xl
                     hover:bg-sky-600 transition-all shadow-lg shadow-sky-200
                     flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
