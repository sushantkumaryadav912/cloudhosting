'use client';
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const ForgotPasswordComponent = () => {
  const [formState, setFormState] = useState({
    email: "",
    isLoading: false,
    isSuccess: false,
    isError: false,
    errorMessage: "",
  });
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [lines, setLines] = useState([]);
  const canvasRef = useRef(null);
  const router = useRouter();

  // Track cursor position for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursor({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Geometric line animations
  useEffect(() => {
    const generateLines = () => {
      const newLines = Array(15).fill().map((_, i) => ({
        id: i,
        x1: Math.random() * window.innerWidth,
        y1: Math.random() * window.innerHeight,
        x2: Math.random() * window.innerWidth,
        y2: Math.random() * window.innerHeight,
        opacity: Math.random() * 0.3 + 0.1,
        speed: Math.random() * 0.5 + 0.2,
        width: Math.random() * 1 + 0.5,
      }));
      setLines(newLines);
    };

    generateLines();
    const interval = setInterval(() => {
      setLines(prevLines => 
        prevLines.map(line => ({
          ...line,
          x1: (line.x1 + line.speed) % window.innerWidth,
          x2: (line.x2 + line.speed * 0.7) % window.innerWidth,
          opacity: Math.sin(Date.now() * 0.001 * line.speed) * 0.1 + 0.2,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Canvas noise effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const noise = () => {
      const w = canvas.width;
      const h = canvas.height;
      
      ctx.clearRect(0, 0, w, h);
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const intensity = Math.floor(Math.random() * 5);
        data[i] = intensity;
        data[i + 1] = intensity;
        data[i + 2] = intensity;
        data[i + 3] = Math.random() * 20;
      }
      
      ctx.putImageData(imageData, 0, 0);
    };

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const noiseInterval = setInterval(noise, 100);
    return () => clearInterval(noiseInterval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormState({ ...formState, isLoading: true, isError: false });

    try {
      // Check if email exists in the system
      const response = await fetch("/JSON_Files/Auth.json");
      if (!response.ok) throw new Error("Failed to fetch Auth.json");
      const { users } = await response.json();

      const userExists = users.some((u) => u.email === formState.email);
      if (!userExists) {
        setFormState({
          ...formState,
          isLoading: false,
          isError: true,
          errorMessage: "Email not found in our records",
        });
        return;
      }

      // Send password reset request to backend API
      const apiResponse = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formState.email }),
      });

      if (!apiResponse.ok) {
        const { error } = await apiResponse.json();
        throw new Error(error);
      }

      setFormState({ ...formState, isLoading: false, isSuccess: true });
      
      // After success, redirect to login after showing success message
      setTimeout(() => {
        router.push("/Login");
      }, 3000);
    } catch (error) {
      setFormState({
        ...formState,
        isLoading: false,
        isError: true,
        errorMessage: error.message || "Error processing request",
      });
    }
  };

  const handleInputChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#0a192f' }}> {/* Navy blue background */}
      {/* Noise texture canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 opacity-30 pointer-events-none" 
      />
      
      {/* Animated geometric lines */}
      {lines.map((line) => (
        <div
          key={line.id}
          className="absolute h-px pointer-events-none"
          style={{
            left: `${line.x1}px`,
            top: `${line.y1}px`,
            width: `${Math.sqrt(Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y2 - line.y1, 2))}px`,
            opacity: line.opacity,
            height: `${line.width}px`,
            backgroundColor: '#4da8da', // Blue line color
            transform: `rotate(${Math.atan2(line.y2 - line.y1, line.x2 - line.x1)}rad)`,
            transformOrigin: 'top left',
          }}
        />
      ))}

      {/* Interactive cursor spotlight */}
      <div 
        className="absolute pointer-events-none blur-3xl rounded-full"
        style={{ 
          left: cursor.x - 150, 
          top: cursor.y - 150, 
          width: '300px', 
          height: '300px', 
          transition: 'opacity 0.3s',
          backgroundColor: 'rgba(77, 168, 218, 0.05)', // Light blue glow
        }} 
      />

      {/* Card container with frosted glass effect */}
      <div 
        className="relative w-full max-w-md backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden transition-all duration-500 transform z-10"
        style={{ 
          backgroundColor: 'rgba(0, 0, 15, 0.7)', // Very dark blue/black
          boxShadow: '0 15px 35px rgba(0,0,0,0.6), 0 5px 15px rgba(0,0,0,0.5)',
          borderColor: 'rgba(77, 168, 218, 0.15)', // Subtle blue border
          borderWidth: '1px',
        }}
      >
        {/* Success overlay */}
        {formState.isSuccess && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-20 animate-fade-in">
            <div className="flex flex-col items-center">
              <svg
                className="w-16 h-16 mb-4 animate-scale-up"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#0a192f" // Navy blue check mark
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-2xl font-bold" style={{ color: '#0a192f' }}>Email Sent!</h3>
              <p className="mt-2 text-center mx-8" style={{ color: 'rgba(10, 25, 47, 0.8)' }}>
                Check your inbox for password reset instructions. Redirecting to login...
              </p>
            </div>
          </div>
        )}

        {/* Card content */}
        <div className="px-10 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-white">RESET PASSWORD</h1>
            <div className="mt-2 w-24 h-0.5 mx-auto" style={{ backgroundColor: '#4da8da' }}></div> {/* Blue accent line */}
            <p className="mt-4 text-white opacity-70">
              Enter your email address and we&apos;ll send you instructions to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Field */}
            <div>
              <label className="block text-white text-base font-medium mb-2" htmlFor="email">
                Email
              </label>
              <div className="relative group mr-16">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 transition-colors duration-300" style={{ color: 'rgba(255,255,255,0.4)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formState.email}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-4 py-4 text-lg text-white border rounded-lg transition duration-300 placeholder-white/30 focus:outline-none"
                  style={{ 
                    backgroundColor: 'rgba(0, 0, 20, 0.5)', 
                    borderColor: 'rgba(77, 168, 218, 0.2)',
                  }}
                  placeholder="Enter your email"
                />
                <div className="absolute bottom-0 left-0 w-0 h-0.5 group-focus-within:w-full transition-all duration-500" style={{ backgroundColor: '#4da8da' }}></div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={formState.isLoading}
                className="w-full py-4 px-6 font-medium rounded-lg shadow-md focus:outline-none transition duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70"
                style={{ 
                  backgroundColor: '#4da8da', // Blue button
                  color: '#000', // Black text
                }}
              >
                {formState.isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      style={{ color: '#000' }}
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "SEND RESET LINK"
                )}
              </button>

              {formState.isError && (
                <div className="mt-4 text-center text-sm py-3 px-4 rounded-lg backdrop-blur-sm"
                  style={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: 'rgba(239, 68, 68, 0.2)',
                    borderWidth: '1px',
                    color: '#f87171'
                  }}>
                  {formState.errorMessage}
                </div>
              )}
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Remember your password?{" "}
              <a href="/Login" className="hover:underline font-medium transition-colors text-white">
                Back to Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordComponent;