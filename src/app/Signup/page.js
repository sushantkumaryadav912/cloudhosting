'use client';
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';

const SignupComponent = () => {
  const [formState, setFormState] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    showConfirmPassword: false,
    isLoading: false,
    isSuccess: false,
    isError: false,
    errorMessage: "",
  });
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
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

  // Password validation
  useEffect(() => {
    const password = formState.password;
    const checks = {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const isValid = Object.values(checks).every(check => check);

    setPasswordStrength({
      ...checks,
      isValid,
    });
  }, [formState.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormState({ ...formState, isLoading: true, isError: false });
  
    if (!passwordStrength.isValid) {
      setFormState({
        ...formState,
        isLoading: false,
        isError: true,
        errorMessage: "Password does not meet requirements",
      });
      return;
    }
  
    if (formState.password !== formState.confirmPassword) {
      setFormState({
        ...formState,
        isLoading: false,
        isError: true,
        errorMessage: "Passwords do not match",
      });
      return;
    }
  
    // Simulate API delay
    setTimeout(() => {
      try {
        // Dummy registration - always succeeds if validations pass
        const dummyToken = `token_${formState.username}_${Date.now()}`;
        setFormState({ ...formState, isLoading: false, isSuccess: true });
        Cookies.set('auth_token', dummyToken, { expires: 1 / 24 });
        Cookies.set('user_data', JSON.stringify({ 
          username: formState.username, 
          email: formState.email,
          role: "user"
        }), { expires: 1 / 24 });

        setTimeout(() => {
          router.push("/Dashboard");
        }, 2000);
      } catch (error) {
        console.error("Submission error:", error);
        setFormState({
          ...formState,
          isLoading: false,
          isError: true,
          errorMessage: error.message || "Error processing signup",
        });
      }
    }, 1500); // 1.5 second delay to simulate API call
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
      isError: false,
    }));
  }
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };
  const handleFocus = (e) => {
    e.target.select();
  };
  const handleBlur = (e) => {
    e.target.setSelectionRange(0, 0);
  };
  

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#0a192f' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-30 pointer-events-none"
      />

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
            backgroundColor: '#4da8da',
            transform: `rotate(${Math.atan2(line.y2 - line.y1, line.x2 - line.x1)}rad)`,
            transformOrigin: 'top left',
          }}
        />
      ))}

      <div
        className="absolute pointer-events-none blur-3xl rounded-full"
        style={{
          left: cursor.x - 150,
          top: cursor.y - 150,
          width: '300px',
          height: '300px',
          transition: 'opacity 0.3s',
          backgroundColor: 'rgba(77, 168, 218, 0.05)',
        }}
      />

      <div
        className="relative w-full max-w-md backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden transition-all duration-500 transform z-10"
        style={{
          backgroundColor: 'rgba(0, 0, 15, 0.7)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.6), 0 5px 15px rgba(0,0,0,0.5)',
          borderColor: 'rgba(77, 168, 218, 0.15)',
          borderWidth: '1px',
        }}
      >
        {formState.isSuccess && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-20 animate-fade-in">
            <div className="flex flex-col items-center">
              <svg
                className="w-16 h-16 mb-4 animate-scale-up"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#0a192f"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-2xl font-bold" style={{ color: '#0a192f' }}>Signup Successful!</h3>
              <p className="mt-2" style={{ color: 'rgba(10, 25, 47, 0.8)' }}>Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        <div className="px-10 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-white">SIGN UP</h1>
            <div className="mt-2 w-20 h-0.5 mx-auto" style={{ backgroundColor: '#4da8da' }}></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-base font-medium mb-2" htmlFor="username">
                Username
              </label>
              <div className="relative group mr-16">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 transition-colors duration-300" style={{ color: 'rgba(255,255,255,0.4)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formState.username}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-4 py-4 text-lg text-white border rounded-lg transition duration-300 placeholder-white/30 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(0, 0, 20, 0.5)',
                    borderColor: 'rgba(77, 168, 218, 0.2)',
                  }}
                  placeholder="Choose a username"
                />
                <div className="absolute bottom-0 left-0 w-0 h-0.5 group-focus-within:w-full transition-all duration-500" style={{ backgroundColor: '#4da8da' }}></div>
              </div>
            </div>

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
              <label className="block text-white text-base font-medium mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative group mr-24">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 transition-colors duration-300" style={{ color: 'rgba(255,255,255,0.4)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={formState.showPassword ? "text" : "password"}
                  required
                  value={formState.password}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-12 py-4 text-lg text-white border rounded-lg transition duration-300 placeholder-white/30 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(0, 0, 20, 0.5)',
                    borderColor: 'rgba(77, 168, 218, 0.2)',
                  }}
                  placeholder="Choose a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent mr-[-80]"
                  onClick={() => setFormState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                >
                  {formState.showPassword ? (
                    <svg className="h-6 w-6 hover:text-white" style={{ color: 'rgba(255,255,255,0.6)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 hover:text-white" style={{ color: 'rgba(255,255,255,0.6)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 group-focus-within:w-full transition-all duration-500" style={{ backgroundColor: '#4da8da' }}></div>
              </div>

              <div className="mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <p>Password must contain:</p>
                <ul className="mt-1 grid grid-cols-2 gap-1">
                  <li className="flex items-center">
                    <span className={`inline-block w-3 h-3 mr-2 rounded-full ${passwordStrength.hasMinLength ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    At least 8 characters
                  </li>
                  <li className="flex items-center">
                    <span className={`inline-block w-3 h-3 mr-2 rounded-full ${passwordStrength.hasUpperCase ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    Uppercase letter
                  </li>
                  <li className="flex items-center">
                    <span className={`inline-block w-3 h-3 mr-2 rounded-full ${passwordStrength.hasLowerCase ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    Lowercase letter
                  </li>
                  <li className="flex items-center">
                    <span className={`inline-block w-3 h-3 mr-2 rounded-full ${passwordStrength.hasNumber ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    Number
                  </li>
                  <li className="flex items-center col-span-2">
                    <span className={`inline-block w-3 h-3 mr-2 rounded-full ${passwordStrength.hasSpecialChar ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    Special character (e.g., !@#$%^&*)
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-white text-base font-medium mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative group mr-24">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 transition-colors duration-300" style={{ color: 'rgba(255,255,255,0.4)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={formState.showConfirmPassword ? "text" : "password"}
                  required
                  value={formState.confirmPassword}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-12 py-4 text-lg text-white border rounded-lg transition duration-300 placeholder-white/30 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(0, 0, 20, 0.5)',
                    borderColor: 'rgba(77, 168, 218, 0.2)',
                  }}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent mr-[-80]"
                  onClick={() => setFormState(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                >
                  {formState.showConfirmPassword ? (
                    <svg className="h-6 w-6 hover:text-white" style={{ color: 'rgba(255,255,255,0.6)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 hover:text-white" style={{ color: 'rgba(255,255,255,0.6)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 group-focus-within:w-full transition-all duration-500" style={{ backgroundColor: '#4da8da' }}></div>
              </div>
              {formState.confirmPassword && (
                <div className="mt-1 text-xs" style={{
                  color: formState.password === formState.confirmPassword ? 'rgba(74, 222, 128, 0.8)' : 'rgba(248, 113, 113, 0.8)'
                }}>
                  {formState.password === formState.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={formState.isLoading}
                className="w-full py-4 px-6 font-medium rounded-lg shadow-md focus:outline-none transition duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70"
                style={{
                  backgroundColor: '#4da8da',
                  color: '#000',
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
                  "SIGN UP"
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

          <div className="mt-8 text-center">
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Already have an account?{" "}
              <a href="/Login" className="hover:underline font-medium transition-colors text-white">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default SignupComponent;