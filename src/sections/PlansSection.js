import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Services = () => {
  const [activeService, setActiveService] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: false });
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);
  
  // Services data with improved descriptions
  const services = [
    {
      id: 1,
      title: 'VPS Server',
      subtitle: 'For Ultimate Control & Performance',
      description: 'A personal Linux-based cloud server that gives you complete administrative control. Ideal for professionals and hobbyists who need customization, dedicated resources, and maximum flexibility for their applications or projects.',
      features: [
        'Full root access and OS selection',
        'Isolated resources for consistent performance',
        'Customizable server configurations',
        'Perfect for development environments'
      ],
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
          <line x1="4" y1="10" x2="20" y2="10"></line>
          <line x1="4" y1="16" x2="20" y2="16"></line>
          <circle cx="7" cy="7" r="1"></circle>
          <circle cx="7" cy="13" r="1"></circle>
          <circle cx="7" cy="19" r="1"></circle>
        </svg>
      ),
      bgClass: 'bg-gradient-to-br from-red-200 to-red-500',
      hoverClass: 'from-red-300 to-red-600',
      price: 'Starting at $10/month'
    },
    {
      id: 2,
      title: 'Shared Hosting',
      subtitle: 'Affordable & User-Friendly',
      description: 'Reliable shared hosting with intuitive control panels, perfect for small businesses and startups. Our optimized infrastructure ensures your website runs smoothly while sharing server resources with other websites.',
      features: [
        'Easy-to-use cPanel/Plesk interface',
        'One-click CMS installations',
        'Managed security & automatic backups',
        'Email hosting included'
      ],
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
          <path d="M19 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
          <path d="M5 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
          <path d="M19 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
          <path d="M5 7v10"></path>
          <path d="M7 5h10"></path>
          <path d="M7 19h10"></path>
          <path d="M19 7v10"></path>
          <path d="M10 10h4v4h-4z"></path>
          <path d="M17 14h2v2"></path>
        </svg>
      ),
      bgClass: 'bg-gradient-to-br from-blue-200 to-blue-500',
      hoverClass: 'from-blue-300 to-blue-600',
      price: 'Will be available soon'
    },
    {
      id: 3,
      title: 'Quick Deploy',
      subtitle: 'Rapid Development Solution',
      description: 'Deploy websites instantly with our streamlined platform. Perfect for developers who need to quickly launch temporary projects, testing environments, or simple websites without complex configuration.',
      features: [
        'Deploy in under 60 seconds',
        'Pre-configured environments',
        'Seamless GitHub integration',
        'Pay-as-you-go pricing'
      ],
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
          <path d="M12 14h.01"></path>
          <path d="M12 12h.01"></path>
          <path d="M12 16h.01"></path>
          <path d="M12 18h.01"></path>
          <path d="M7 15h.01"></path>
          <path d="M17 17h.01"></path>
          <path d="M14.5 9.5a2.5 2.5 0 0 0 -5 0"></path>
        </svg>
      ),
      bgClass: 'bg-gradient-to-br from-green-200 to-green-500',
      hoverClass: 'from-green-300 to-green-600',
      price: 'Starting at $2.99/month'
    }
  ];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const titleVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const expandCard = (id) => {
    if (activeService === id) {
      setActiveService(null);
      setTimeout(() => setIsExpanded(false), 300);
    } else {
      setActiveService(id);
      setIsExpanded(true);
    }
  };

  // Particle animation for background
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10
  }));

  return (
    <section className="py-24 px-4 md:px-8 lg:px-16 bg-gray-900 text-white overflow-hidden relative">
      {/* Animated Particles Background */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white opacity-10"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}

      <div className="max-w-6xl mx-auto relative" ref={containerRef}>
        {/* Background decorative elements */}
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div 
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Section Title */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={titleVariants}
          className="text-center mb-20 relative z-10"
        >
          <motion.div className="inline-block">
            <motion.h2 
              className="text-5xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-purple-300"
              animate={floatingAnimation}
            >
              Hosting Solutions
            </motion.h2>
            <motion.div 
              className="h-1 w-24 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "50%" }}
              transition={{ delay: 0.8, duration: 0.8 }}
            />
          </motion.div>
          
          <motion.p 
            className="text-gray-300 max-w-3xl mx-auto text-xl mt-6 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Tailored hosting services designed to meet your specific needs, from personal projects to enterprise applications. Select the perfect solution to power your online presence.
          </motion.p>
        </motion.div>
        
        {/* Services Grid */}
        <motion.div 
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 relative z-10 mb-20"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              className={`${service.bgClass} hover:${service.hoverClass} rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer h-full flex flex-col shadow-lg hover:shadow-2xl relative ${activeService === service.id ? 'md:col-span-3 md:row-span-2' : ''}`}
              variants={itemVariants}
              layout
              onClick={() => expandCard(service.id)}
              transition={{ layout: { duration: 0.6, type: "spring" } }}
            >
              <div className={`p-8 flex flex-col h-full ${activeService === service.id ? 'md:flex-row md:items-start' : 'items-center text-center'}`}>
                <motion.div 
                  className={`mb-8 text-black ${activeService === service.id ? 'md:mr-8 md:mb-0 md:flex-shrink-0' : ''}`}
                  animate={{
                    rotate: activeService === service.id ? 360 : 0,
                    scale: activeService === service.id ? 1.1 : 1
                  }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                >
                  <motion.div
                    className="bg-white/20 rounded-full p-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    {service.icon}
                  </motion.div>
                </motion.div>
                
                <div className={`flex-grow ${activeService === service.id ? 'md:flex md:flex-col md:justify-between' : ''}`}>
                  <div>
                    <motion.h3 
                      className="text-2xl md:text-3xl font-bold mb-2 text-black"
                      layout="position"
                    >
                      {service.title}
                    </motion.h3>
                    
                    <motion.p 
                      className="text-lg font-medium text-black/80 mb-4"
                      layout="position"
                    >
                      {service.subtitle}
                    </motion.p>
                    
                    <motion.p 
                      className="text-gray-800 mb-6 text-lg"
                      layout="position"
                    >
                      {service.description}
                    </motion.p>
                  </div>
                  
                  <AnimatePresence>
                    {activeService === service.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <h4 className="text-xl font-bold mb-4 text-black">Key Features:</h4>
                        <ul className="space-y-2 mb-6">
                          {service.features.map((feature, idx) => (
                            <motion.li 
                              key={idx} 
                              className="flex items-center text-gray-800"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              <svg className="w-5 h-5 mr-2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              {feature}
                            </motion.li>
                          ))}
                        </ul>
                        
                        <div className="flex flex-wrap justify-between items-center mt-6">
                          <p className="text-xl font-bold text-black">{service.price}</p>
                          <div className="flex space-x-4 mt-4 md:mt-0">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => window.location.href = '/Login'}
                              className="bg-white text-gray-900 py-2 px-6 rounded-lg font-medium transition-all duration-300"
                            >
                              Get Started
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-black/20 text-white py-2 px-6 rounded-lg font-medium transition-all duration-300"
                            >
                              Learn More
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {!activeService && (
                    <motion.div
                      className="mt-auto"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="font-bold text-black mb-3">{service.price}</p>
                      <div className="inline-flex justify-center items-center bg-black/10 hover:bg-black/20 text-white py-2 px-5 rounded-lg transition-all duration-300">
                        <span>Expand Details</span>
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Bottom corner effect */}
              <motion.div
                className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-tl-full"
                whileHover={{ scale: 1.2, rotate: 15 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </motion.div>
        
        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 30 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-center mt-20 mb-10 relative z-10 bg-gradient-to-r from-gray-800/60 via-gray-800/80 to-gray-800/60 rounded-2xl p-10 backdrop-blur-md"
        >
          <motion.h3
            className="text-2xl md:text-3xl font-bold mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            Not Sure Which Solution Is Right For You?
          </motion.h3>
          
          <motion.p 
            className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto"
          >
            Our team of hosting experts is ready to analyze your specific needs and recommend the perfect solution for your business, project, or hobby.
          </motion.p>
          
          <motion.div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#fff", color: "#111" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/90 text-gray-900 py-3 px-8 rounded-lg font-medium transition-all duration-300 shadow-lg w-full sm:w-auto"
            >
              Schedule Consultation
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent border-2 border-white/50 text-white py-3 px-8 rounded-lg font-medium transition-all duration-300 w-full sm:w-auto"
            >
              Compare Plans
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;