import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';

const FeatureSection = () => {
  const [activeFeature, setActiveFeature] = useState(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-100px 0px" });
  
  const features = [
    {
      imgSrc: "/image/Frame.svg",
      title: "World-Class Hosting",
      description: "Premium hardware and software architecture designed for optimal performance, security, and reliability.",
      details: "Our infrastructure utilizes state-of-the-art data centers with redundant systems, ensuring 99.9% uptime and lightning-fast load times for your applications."
    },
    {
      imgSrc: "/image/robot-gear.svg",
      title: "Fully Automatic Deployment",
      description: "Deploy websites and applications with a single click using our proprietary CI/CD pipeline.",
      details: "Integrated with major version control systems, our platform automatically builds, tests, and deploys your code whenever you push changes - no manual intervention needed."
    },
    {
      imgSrc: "/image/Vector.svg",
      title: "Quick & Cost-Effective",
      description: "Launch projects faster and more affordably without compromising on quality or features.",
      details: "Our streamlined workflow reduces deployment time by up to 70% while offering competitive pricing plans that scale with your needs."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const floatAnimation = {
    animate: {
      y: [-8, 8, -8],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  const handleFeatureClick = (index) => {
    setActiveFeature(activeFeature === index ? null : index);
  };

  return (
    <section 
      id="feature-section" 
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-blue-50 to-white overflow-hidden relative"
    >
      {/* Background decoration elements */}
      <motion.div 
        className="absolute top-20 left-10 w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          x: [-10, 10, -10],
          y: [-10, 5, -10]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-100 rounded-full opacity-20 blur-3xl"
        animate={{ 
          scale: [1, 1.3, 1],
          x: [10, -10, 10],
          y: [5, -5, 5]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-20"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={titleVariants}
        >
          <h2 className="text-5xl font-bold mb-6 text-gray-800 tracking-tight">Why Choose Our Cloud Hosting?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our mission is to revolutionize web development by providing intuitive, powerful, and 
            reliable hosting solutions that let you focus on creating amazing experiences.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 
                ${activeFeature === index ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-xl'}`}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              onClick={() => handleFeatureClick(index)}
            >
              <motion.div 
                className="flex justify-center items-center h-32 mb-6"
                variants={floatAnimation}
                animate="animate"
              >
                <div className="relative w-24 h-24">
                  <Image
                    src={feature.imgSrc}
                    alt={feature.title}
                    layout="fill"
                    objectFit="contain"
                    priority
                  />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold mb-3 text-center text-gray-800">{feature.title}</h3>
              <p className="text-gray-600 text-center mb-4">{feature.description}</p>
              
              {/* Expandable content */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: activeFeature === index ? 'auto' : 0,
                  opacity: activeFeature === index ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-gray-100 mt-4">
                  <p className="text-gray-700">{feature.details}</p>
                  <div className="mt-4 flex justify-center">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
              </motion.div>
              
              {/* Interactive hint */}
              {activeFeature !== index && (
                <motion.p 
                  className="text-blue-500 text-sm text-center mt-4 cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Click to expand
                </motion.p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;