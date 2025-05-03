import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const PlansSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(null);
  const [autoplayActive, setAutoplayActive] = useState(true);
  const autoplayRef = useRef(null);

  // Enhanced plans data with unique values
  const plans = [
    {
      id: 1,
      name: 'Venus',
      price: '1.99',
      discount: 15,
      description: 'Perfect for personal blogs',
      features: [
        '100% Up Time',
        '1x CPU, 1GB RAM',
        'NGINX powered server',
        'All cPanel Features & SSL',
        'Imunify360 AI Anti-Virus',
        'Premium Data-center Infrastructure'
      ],
      color: '#4F46E5'
    },
    {
      id: 2,
      name: 'Mercury',
      price: '3.99',
      discount: 10,
      description: 'Ideal for small businesses',
      features: [
        '100% Up Time',
        '2x CPU, 2GB RAM',
        'NGINX powered server',
        'All cPanel Features & SSL',
        'Imunify360 AI Anti-Virus',
        'Premium Data-center Infrastructure',
        'Daily Backups'
      ],
      color: '#0EA5E9'
    },
    {
      id: 3,
      name: 'Jupiter',
      price: '7.99',
      discount: 20,
      description: 'Best for growing websites',
      features: [
        '100% Up Time',
        '4x CPU, 4GB RAM',
        'NGINX powered server',
        'All cPanel Features & SSL',
        'Imunify360 AI Anti-Virus',
        'Premium Data-center Infrastructure',
        'Daily Backups',
        'Priority Support'
      ],
      color: '#8B5CF6'
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

  // Function to render features with checkmarks
  const renderPlanFeatures = (features, color) => {
    return features.map((feature, index) => (
      <motion.div 
        key={index} 
        className="flex items-center py-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className="mr-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#EAEAEA" />
            <path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-gray-700 font-medium">{feature}</span>
      </motion.div>
    ));
  };

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-blue-50">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-4xl font-bold text-center mb-12 text-blue-600"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Our Plans and Services
        </motion.h2>
        
        <motion.div 
          className="bg-blue-50 rounded-lg p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.h3 
            className="text-2xl font-bold text-center mb-8 text-blue-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Hosting Plans
          </motion.h3>
          
          {/* Plans grid - replacing carousel with grid layout */}
          <div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            onMouseEnter={() => setAutoplayActive(false)}
            onMouseLeave={() => setAutoplayActive(true)}
          >
            {plans.map((plan, index) => (
              <motion.div 
                key={plan.id}
                className="flex justify-center"
                onMouseEnter={() => setIsHovering(index)}
                onMouseLeave={() => setIsHovering(null)}
                onClick={() => setActiveIndex(index)}
                layout
              >
                <motion.div 
                  className={`w-full border border-gray-200 rounded-lg overflow-hidden bg-white shadow-md h-full transition-all duration-300 cursor-pointer`}
                  animate={{ 
                    scale: activeIndex === index ? 1.05 : 0.95,
                    boxShadow: activeIndex === index 
                      ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="p-6">
                    <h4 className="text-2xl font-bold mb-1">{plan.name}</h4>
                    <div className="flex items-baseline mb-1">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-gray-600 ml-1">/monthly</span>
                    </div>
                    
                    {plan.discount > 0 && (
                      <div className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded inline-block mb-3">
                        Save {plan.discount}%
                      </div>
                    )}
                    
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    
                    <motion.button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded transition-colors duration-300"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {window.location.href='/PaymentGateway';}}
                    >
                      Start now
                    </motion.button>
                  </div>
                  <div className="px-6 pb-6">
                    {renderPlanFeatures(plan.features, activeIndex === index ? plan.color : '#0056D2')}
                  </div>
                </motion.div>
              </motion.div>
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
        </motion.div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-blue-600 text-blue-600 rounded-lg font-semibold transition-colors hover:bg-blue-100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Compare All Plans
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default PlansSection;