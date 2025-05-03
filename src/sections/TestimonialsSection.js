import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Testimonials = ({ testimonials = defaultTestimonials }) => {
  const [activeIndex, setActiveIndex] = useState(1);
  const [direction, setDirection] = useState(0);
  const autoplayTimeoutRef = useRef(null);

  const startAutoplay = () => {
    autoplayTimeoutRef.current = setTimeout(() => {
      nextTestimonial();
    }, 5000); // Change testimonial every 5 seconds
  };

  const resetAutoplay = () => {
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
      startAutoplay();
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
    };
  }, []);

  const nextTestimonial = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    resetAutoplay();
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    resetAutoplay();
  };

  // Fixed transition variants
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          What our <span className="text-blue-500">clients</span> say
        </h2>
        
        <div className="relative">
          <div className="flex justify-between mb-8">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-gray-200 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous testimonial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-gray-200 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next testimonial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="relative h-96 overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "tween", duration: 0.5, ease: "easeInOut" },
                  opacity: { duration: 0.3 }
                }}
                className="absolute top-0 left-0 w-full h-full"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                  {[
                    (activeIndex === 0 ? testimonials.length - 1 : activeIndex - 1),
                    activeIndex,
                    (activeIndex === testimonials.length - 1 ? 0 : activeIndex + 1)
                  ].map((index, position) => {
                    const testimonial = testimonials[index];
                    const isActive = position === 1;
                    
                    return (
                      <div
                        key={testimonial.id}
                        className={`
                          ${isActive ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white md:scale-105 z-20' : 'bg-white text-gray-800 z-10'}
                          rounded-lg shadow-xl p-6 transform transition-all duration-300
                          ${position === 0 ? 'md:translate-x-4' : position === 2 ? 'md:-translate-x-4' : ''}
                        `}
                      >
                        <div className="h-full flex flex-col justify-between">
                          <div className="mb-6">
                            <svg className="w-10 h-10 text-blue-300 mb-3 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14.017 21v-7.391c0-3.991 2.964-7.228 6.617-7.228V3c-5.086 0-9.209 4.093-9.209 9.154V21h2.592zm-8.595 0v-7.391c0-3.991 2.964-7.228 6.641-7.228V3C7.002 3 2.88 7.093 2.88 12.154V21h2.542z"/>
                            </svg>
                            <p className="text-lg leading-relaxed">{testimonial.content}</p>
                          </div>
                          <div className="flex items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-300' : 'bg-blue-100'} text-xl font-bold`}>
                              {testimonial.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <h3 className="font-bold text-xl">{testimonial.name}</h3>
                              <p className={`${isActive ? 'text-blue-200' : 'text-gray-500'}`}>
                                {testimonial.title}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > activeIndex ? 1 : -1);
                  setActiveIndex(index);
                  resetAutoplay();
                }}
                className={`mx-1 w-3 h-3 rounded-full transition-colors focus:outline-none ${
                  index === activeIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Default testimonials data
const defaultTestimonials = [
  {
    id: 1,
    name: "Sundaresh",
    title: "CEO at Godrej",
    content: "The scalability of Cloud Hosting is a game-changer. We can handle traffic spikes without worrying about downtime, and the pricing is transparent."
  },
  {
    id: 2,
    name: "Herman Melville",
    title: "CEO of Mahendra and Mahendra",
    content: "Cloud Hosting has completely transformed the way we manage our applications. The user-friendly dashboard and automated deployments save us so much time!"
  },
  {
    id: 3,
    name: "Neil Winstley",
    title: "CEO of Flix",
    content: "The auto-detect and deploy feature is brilliant! It makes hosting our projects in multiple languages seamless and stress-free."
  },
  {
    id: 4,
    name: "Sarah Johnson",
    title: "CTO of TechInnovate",
    content: "Their customer support is exceptional. Any time we've had an issue, it's been resolved within hours, not days."
  },
  {
    id: 5,
    name: "Michael Chen",
    title: "Lead Developer at StartupHub",
    content: "The integrated analytics tools have given us insights we never had before. Now we can make data-driven decisions about our infrastructure."
  },
  {
    id: 6,
    name: "Sushant",
    title: "CEO at Doodling.App",
    content: "Loved the idea behind auto-detection. It streamlines our workflow and eliminates configuration headaches."
  }
];

export default Testimonials;