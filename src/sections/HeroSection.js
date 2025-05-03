import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

const HeroSection = () => {
  const [hoverFeature, setHoverFeature] = useState(null);
  
  // Enhanced animations
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const floatAnimation = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };
  
  const buttonHoverAnimation = {
    whileHover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    whileTap: { 
      scale: 0.98 
    }
  };
  
  const featureHoverVariants = {
    hover: {
      scale: 1.03,
      backgroundColor: "#f8fafc",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <section className="bg-gradient-to-b from-white to-blue-50 py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Top tagline with improved visibility */}
        <motion.div
          className="text-center md:text-left mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-lg md:text-xl font-medium">
            Trusted By 10,000+ Sites Worldwide
          </span>
        </motion.div>
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Column - Enhanced Text Content */}
          <motion.div 
            className="w-full lg:w-1/2"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-10 tracking-tight leading-tight text-center lg:text-left"
              variants={fadeIn}
            >
              Reach <span className="text-blue-500">any</span> audience with
              <motion.span 
                className="block text-blue-500 relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                reliable hosting
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="100%" 
                  height="10" 
                  viewBox="0 0 200 10" 
                  className="absolute -bottom-1 left-0"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                >
                  <path 
                    d="M0,5 C50,15 150,-5 200,5" 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </motion.span>
            </motion.h1>
            
            {/* Feature boxes with enhanced interactivity */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10"
              variants={fadeIn}
            >
              <motion.div 
                className="p-6 rounded-xl border border-gray-200 bg-white flex items-center"
                variants={featureHoverVariants}
                whileHover="hover"
                onHoverStart={() => setHoverFeature('trusted')}
                onHoverEnd={() => setHoverFeature(null)}
              >
                <div className="mr-4">
                  <motion.div 
                    animate={hoverFeature === 'trusted' ? { rotate: [0, -10, 10, -10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                      <circle cx="12" cy="8" r="7"></circle>
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                    </svg>
                  </motion.div>
                </div>
                <div>
                  <p className="font-medium text-gray-600 text-lg">Trusted by</p>
                  <p className="text-gray-800 font-bold text-xl">10,000+ Businesses</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl border border-gray-200 bg-white flex items-center"
                variants={featureHoverVariants}
                whileHover="hover"
                onHoverStart={() => setHoverFeature('moneyback')}
                onHoverEnd={() => setHoverFeature(null)}
              >
                <div className="mr-4">
                  <motion.div 
                    animate={hoverFeature === 'moneyback' ? { y: [0, -5, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <polyline points="9 10 12 7 15 10"></polyline>
                      <line x1="12" y1="7" x2="12" y2="17"></line>
                    </svg>
                  </motion.div>
                </div>
                <div>
                  <p className="font-medium text-gray-600 text-lg">No questions asked</p>
                  <p className="text-gray-800 font-bold text-xl">7-Day Money-Back</p>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Interactive CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              variants={fadeIn}
            >
              <Link href="/plans" passHref>
                <motion.button 
                  className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                  whileHover={{ scale: 1.05, backgroundColor: "#2563eb" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Choose Plans
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </motion.button>
              </Link>
              <Link href="/explore" passHref>
                <motion.button 
                  className="px-8 py-4 bg-white border border-gray-300 text-gray-700 text-lg font-medium rounded-lg flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05, backgroundColor: "#f8fafc" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore More
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16l4-4-4-4M8 12h8"></path>
                  </svg>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Right Column - Interactive Image */}
          <motion.div 
            className="w-full lg:w-1/2 flex justify-center"
            initial="initial"
            animate="animate"
            variants={floatAnimation}
          >
            <motion.div 
              className="relative w-full max-w-xl h-96 md:h-[480px] lg:h-[540px]"
              whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
            >
              <Image
                src="/image/hero.png"
                alt="Web Hosting Illustration"
                layout="fill"
                objectFit="contain"
                priority
              />
              {/* Decorative elements */}
              <motion.div
                className="absolute -top-8 -left-8 w-20 h-20 rounded-full bg-blue-50 z-0"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <motion.div
                className="absolute -bottom-8 -right-8 w-16 h-16 rounded-full bg-blue-100 z-0"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 1
                }}
              />
            </motion.div>
          </motion.div>
        </div>
        
        {/* Added social proof bar */}
        <motion.div
          className="mt-16 pt-8 border-t border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-center text-gray-500 font-medium mb-6">Trusted by companies worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
            {['Google', 'Microsoft', 'Amazon', 'IBM', 'Oracle'].map((company) => (
              <motion.div 
                key={company}
                whileHover={{ opacity: 1, scale: 1.05 }}
                className="text-gray-400 font-bold text-xl"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;