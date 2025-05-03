'use client';
import React, { useState, useEffect } from 'react';
import HeroSection from '../sections/HeroSection';
import FeaturesSection from '../sections/FeaturesSection';
import PlansSection from '../sections/PlansSection';
import Testimonials from '../sections/TestimonialsSection';
import ContactSection from '../sections/ContactSection';
import PricingSection from '../sections/PricingSection';

const HomePage = () => {
    return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <div id = "about-section">
        <FeaturesSection />
      </div>
      <div id="plans-section">
        <PlansSection />
      </div>
      <PricingSection/>
      <Testimonials />
      <div id= "contact-section">
        <ContactSection />
      </div>
    </div>
  );
};

export default HomePage;