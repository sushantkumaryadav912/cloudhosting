'use client';
import React, { useState, useEffect, useRef } from 'react';

const CustomizablePlansPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplayActive, setAutoplayActive] = useState(true);
  const [ramValues, setRamValues] = useState([2048, 4096, 8192]); // Default RAM values in MB
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [generatedIP, setGeneratedIP] = useState("");
  const [formData, setFormData] = useState({
    userId: "user123", // Default user ID
    serviceId: "", 
    subServiceName: "", 
    vpsName: "",
    username: "",
    password: "",
  });
  const autoplayRef = useRef(null);

  // Static configuration for each plan
  const plans = [
    {
      id: "plan-101",
      name: 'Venus',
      price: '1.99',
      discount: 15,
      description: 'Perfect for personal blogs',
      color: '#4F46E5',
      config: {
        cpanel: true,
        ssl: true,
        backups: false,
        antivirus: "Basic"
      }
    },
    {
      id: "plan-202",
      name: 'Mercury',
      price: '3.99',
      discount: 10,
      description: 'Ideal for small businesses',
      color: '#0EA5E9',
      config: {
        cpanel: true,
        ssl: true,
        backups: true,
        antivirus: "Standard"
      }
    },
    {
      id: "plan-303",
      name: 'Jupiter',
      price: '7.99',
      discount: 20,
      description: 'Best for growing websites',
      color: '#8B5CF6',
      config: {
        cpanel: true,
        ssl: true,
        backups: true,
        antivirus: "Premium"
      }
    }
  ];

  // Setup autoplay
  useEffect(() => {
    if (autoplayActive) {
      startAutoplay();
    }

    return () => {
      if (autoplayRef.current) {
        clearTimeout(autoplayRef.current);
      }
    };
  }, [autoplayActive]);

  // Function to handle autoplay
  const startAutoplay = () => {
    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current);
    }
    
    autoplayRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev === plans.length - 1 ? 0 : prev + 1));
    }, 5000);
  };

  // Reset autoplay when active index changes
  useEffect(() => {
    if (autoplayActive) {
      startAutoplay();
    }
  }, [activeIndex, autoplayActive]);

  // Update RAM value for a specific plan
  const handleRamChange = (index, gbValue) => {
    const mbValue = gbValue * 1024;
    const newRamValues = [...ramValues];
    newRamValues[index] = mbValue;
    setRamValues(newRamValues);
  };

  // Generate features list for each plan
  const getPlanFeatures = (planIndex) => {
    const ramInGb = ramValues[planIndex] / 1024;
    const cpuCount = Math.max(1, Math.floor(ramInGb / 2)); // 1 CPU per 2GB of RAM

    const baseFeatures = [
      '100% Up Time',
      `${cpuCount}x CPU, ${ramValues[planIndex]} MB RAM`,
      'NGINX powered server',
      'All cPanel Features & SSL',
      'Imunify360 AI Anti-Virus',
      'Premium Data-center Infrastructure'
    ];

    // Add additional features for higher tier plans
    if (planIndex >= 1) {
      baseFeatures.push('Daily Backups');
    }
    
    if (planIndex >= 2) {
      baseFeatures.push('Priority Support');
    }

    // Add more features based on RAM size
    if (ramValues[planIndex] >= 4096) {
      baseFeatures.push('Enhanced DDoS Protection');
    }
    
    if (ramValues[planIndex] >= 6144) {
      baseFeatures.push('Dedicated IP Address');
    }
    
    if (ramValues[planIndex] >= 8192) {
      baseFeatures.push('Weekly Performance Reports');
    }

    return baseFeatures;
  };

  // Function to render features with checkmarks
  const renderPlanFeatures = (planIndex, color) => {
    const features = getPlanFeatures(planIndex);
    
    return features.map((feature, index) => (
      <div key={index} className="flex items-center py-2">
        <div className="mr-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#EAEAEA" />
            <path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-gray-700 font-medium">{feature}</span>
      </div>
    ));
  };

  // Calculate adjusted price based on RAM
  const calculatePrice = (basePrice, ramInMB) => {
    const ramInGB = ramInMB / 1024;
    const additionalCost = Math.max(0, (ramInGB - 2) * 1.5); // $1.50 per extra GB
    return (parseFloat(basePrice) + additionalCost).toFixed(2);
  };

  // Handle starting a plan (show credentials modal)
  const handleStartPlan = (planIndex) => {
    setFormData({
      ...formData,
      serviceId: plans[planIndex].id,
      subServiceName: plans[planIndex].name
    });
    setShowCredentialsModal(true);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulate form submission to backend
    console.log("Submitting form data:", formData);
    
    // Close the modal
    setShowCredentialsModal(false);
    
    // Generate a random IP address for demonstration
    const randomIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    setGeneratedIP(randomIP);
    
    // Show success alert
    setShowSuccessAlert(true);
    
    // Hide alert after 5 seconds
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">CloudHost Plans</h1>
        </div>
      </header>

      <main>
        <section className="py-16 px-4 md:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-blue-600 mb-4">Customizable Hosting Plans</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the perfect hosting plan with the exact amount of RAM you need for your project
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
              <h3 className="text-2xl font-bold text-center mb-8 text-blue-800">
                Select Your Ideal Setup
              </h3>
              
              {/* Plans grid with RAM sliders */}
              <div 
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
                onMouseEnter={() => setAutoplayActive(false)}
                onMouseLeave={() => setAutoplayActive(true)}
              >
                {plans.map((plan, index) => (
                  <div 
                    key={plan.id}
                    className={`flex flex-col border-2 rounded-xl overflow-hidden bg-white transition-all duration-300 h-full
                      ${activeIndex === index ? 'border-blue-500 shadow-lg' : 'border-gray-200 shadow-md'}`}
                    onClick={() => setActiveIndex(index)}
                  >
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-2xl font-bold text-gray-800">{plan.name}</h4>
                        {plan.discount > 0 && (
                          <div className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Save {plan.discount}%
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-baseline mb-2">
                        <span className="text-3xl font-bold text-blue-600">
                          ${calculatePrice(plan.price, ramValues[index])}
                        </span>
                        <span className="text-gray-600 ml-1">/monthly</span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{plan.description}</p>
                      
                      {/* RAM Configuration */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          RAM: {ramValues[index]} MB ({(ramValues[index] / 1024).toFixed(1)} GB)
                        </label>
                        <div className="flex items-center">
                          <span className="text-xs mr-2">2GB</span>
                          <input
                            type="range"
                            min="2"
                            max="8"
                            step="0.5"
                            value={ramValues[index] / 1024}
                            onChange={(e) => handleRamChange(index, parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <span className="text-xs ml-2">8GB</span>
                        </div>
                      </div>
                      
                      <button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartPlan(index);
                        }}
                      >
                        Start now
                      </button>
                    </div>
                    
                    <div className="px-6 py-4 flex-grow">
                      <h5 className="font-semibold text-gray-700 mb-3">Features included:</h5>
                      {renderPlanFeatures(index, activeIndex === index ? plan.color : '#0056D2')}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Navigation dots */}
              <div className="flex justify-center mt-8 space-x-2">
                {plans.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveIndex(index);
                      setAutoplayActive(false);
                    }}
                    className={`transition-all duration-300 h-2 rounded-full ${
                      activeIndex === index ? 'w-12 bg-blue-600' : 'w-8 bg-gray-300'
                    }`}
                    aria-label={`View ${plans[index].name} plan`}
                  />
                ))}
              </div>
            </div>
            
            {/* Compare plans button */}
            <div className="mt-12 text-center">
              <button
                className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-blue-600 text-blue-600 rounded-lg font-semibold transition-colors hover:bg-blue-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Compare All Plans
              </button>
            </div>

            {/* Additional information section */}
            <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-center mb-6 text-blue-800">Why Choose Our Hosting?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold">High Performance</h4>
                  </div>
                  <p className="text-gray-700">Our servers use the latest hardware for optimal speed and reliability.</p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold">Advanced Security</h4>
                  </div>
                  <p className="text-gray-700">AI-powered protection with Imunify360 keeps your site secure from threats.</p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold">24/7 Support</h4>
                  </div>
                  <p className="text-gray-700">Our expert team is available around the clock to assist with any issues.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="mb-2">© 2025 CloudHost. All rights reserved.</p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-300 hover:text-white">Terms</a>
              <a href="#" className="text-gray-300 hover:text-white">Privacy</a>
              <a href="#" className="text-gray-300 hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Credentials Modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowCredentialsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Setup Your {formData.subServiceName} VPS
            </h3>
            
            <p className="text-gray-600 mb-6">
              Please provide the required information to set up your virtual private server.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VPS Name
                </label>
                <input
                  type="text"
                  name="vpsName"
                  value={formData.vpsName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., my-website-server"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Choose a username"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Create a strong password"
                  required
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h4 className="font-medium text-gray-800 mb-2">Selected Plan Configuration</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Plan:</div>
                  <div className="font-semibold">{formData.subServiceName}</div>
                  
                  <div>RAM:</div>
                  <div className="font-semibold">{ramValues[activeIndex]} MB</div>
                  
                  <div>CPU:</div>
                  <div className="font-semibold">{Math.max(1, Math.floor(ramValues[activeIndex] / 1024 / 2))}x CPU Cores</div>
                  
                  <div>Price:</div>
                  <div className="font-semibold">${calculatePrice(plans[activeIndex].price, ramValues[activeIndex])}/month</div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCredentialsModal(false)}
                  className="mr-3 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Deploy Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Alert with IP */}
      {showSuccessAlert && (
        <div className="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-lg max-w-md animate-fade-in z-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Server deployed successfully!
              </p>
              <p className="mt-1 text-sm text-green-700">
                Your server IP address: <span className="font-mono font-bold">{generatedIP}</span>
              </p>
              <p className="mt-2 text-xs text-green-600">
                Login credentials have been sent to your email.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setShowSuccessAlert(false)}
                  className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizablePlansPage;