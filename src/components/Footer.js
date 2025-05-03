'use client';

import React, { useState } from 'react';
import { FaFacebookF, FaInstagram, FaEnvelope, FaLinkedinIn } from 'react-icons/fa';
import {FaXTwitter} from 'react-icons/fa6';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const FooterSection = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredSocial, setHoveredSocial] = useState(null);

  // Dynamic services data
  const servicesLinks = [
    { id: 'web', label: 'VPS Server', path: '#plans-section' },
    { id: 'cloud', label: 'Shared Hosting', path: '#plans-section' },
    { id: 'managed', label: 'Quick Deploy', path: '#plans-section' },
  ];

  // Dynamic company links
  const companyLinks = [
    { id: 'about', label: 'About Us', path: '#about-section' },
    { id: 'team', label: 'Our Team', path: '/team' },
  ];

  // Dynamic support links
  const supportLinks = [
    { id: 'help', label: 'Help Center', path: '/support/help' },
    { id: 'ticket', label: 'Ticket System', path: '/support/tickets' },
    { id: 'community', label: 'Community', path: '/community' },
  ];

  // Social media links
  const socialLinks = [
    { id: 'facebook', icon: FaFacebookF, color: 'text-blue-400', url: 'https://facebook.com' },
    { id: 'twitter', icon: FaXTwitter, color: 'text-blue-500', url: 'https://x.com' },
    { id: 'instagram', icon: FaInstagram, color: 'text-pink-500', url: 'https://instagram.com' },
    { id: 'linkedin', icon: FaLinkedinIn, color: 'text-blue-700', url: 'https://linkedin.com' },
    { id: 'email', icon: FaEnvelope, color: 'text-yellow-500', url: 'mailto:dev.vachhani.btech2023@sitpune.edu.in' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubscribed(true);
    setTimeout(() => {
      setIsSubscribed(false);
      setEmail('');
    }, 3000);
  };

  const handleNavigation = (path) => {
    router.push(path);
  };

  const renderLinkList = (links, title) => (
    <div>
      <h3 className="text-xl font-bold relative">
        {title}
        <div className="h-1 w-12 bg-gradient-to-r from-blue-400 to-purple-500 mt-2"></div>
      </h3>
      <ul className="mt-4 space-y-3 text-lg">
        {links.map((link) => (
          <li key={link.id}>
            <a
              onClick={() => handleNavigation(link.path)}
              onMouseEnter={() => setHoveredItem(link.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`cursor-pointer relative inline-block transition-all duration-300 ${
                hoveredItem === link.id ? 'text-blue-400 translate-x-2' : 'text-gray-300 hover:text-blue-400'
              }`}
            >
              {link.label}
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 ${
                hoveredItem === link.id ? 'w-full' : ''
              }`}></span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-gray-900 text-white py-16 px-10 text-lg">
      <div className="max-w-7xl mx-auto">
        {/* Newsletter */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="p-8 rounded-xl bg-gradient-to-r from-blue-900 to-purple-900 shadow-lg">
            <h3 className="text-2xl font-bold text-center">Stay Updated</h3>
            <p className="text-gray-200 mt-2 text-lg text-center">
              Subscribe to get the latest news, updates, and special offers delivered to your inbox.
            </p>
            {isSubscribed ? (
              <div className="mt-5 bg-green-500 bg-opacity-30 border border-green-500 rounded-lg p-4 text-center transition-all duration-500">
                <p className="text-white">Thank you for subscribing! Check your inbox for some interesting updates.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-5 py-3 w-full sm:w-80 rounded-lg bg-white border border-gray-700 focus:ring-2 focus:ring-blue-500 text-lg text-black outline-none transition-all duration-300 focus:border-blue-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg text-lg w-full sm:w-auto transition-all duration-300 transform hover:scale-105"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleNavigation('/')}>
              <div className="transform transition-transform duration-300 group-hover:scale-110">
                <Image width={60} height={60} alt="Logo" src="/image/Cloud.svg" />
              </div>
              <h2 className="text-2xl font-bold group-hover:text-blue-400 transition-colors duration-300">Cloud Hosting</h2>
            </div>
            <p className="text-gray-400 mt-4 text-lg">
              Providing reliable cloud hosting solutions for businesses of all sizes.
            </p>
            <div className="mt-5 text-gray-400 text-lg space-y-2">
              <p className="flex items-center hover:text-blue-300 transition-colors duration-300 cursor-pointer">
                <span className="inline-block w-6">📍</span> G-107 LHBC Hostel, Pune, India 412115
              </p>
              <p className="flex items-center hover:text-blue-300 transition-colors duration-300 cursor-pointer">
                <span className="inline-block w-6">📞</span> +91 7016877199
              </p>
              <p className="flex items-center hover:text-blue-300 transition-colors duration-300 cursor-pointer">
                <span className="inline-block w-6">✉️</span>dev.vachhani.btech2023@sitpune.edu.in
              </p>
            </div>
          </div>

          {/* Services */}
          {renderLinkList(servicesLinks, 'Services')}

          {/* Company */}
          {renderLinkList(companyLinks, 'Company')}

          {/* Support */}
          {renderLinkList(supportLinks, 'Support')}
        </div>

        {/* Social Media and Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl relative"
                  onMouseEnter={() => setHoveredSocial(social.id)}
                  onMouseLeave={() => setHoveredSocial(null)}
                >
                  <Icon 
                    className={`transition-all duration-300 transform ${
                      hoveredSocial === social.id ? `${social.color} scale-125` : 'text-gray-400'
                    }`} 
                  />
                  <span 
                    className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 ${social.color} transition-all duration-300 ${
                      hoveredSocial === social.id ? 'w-full' : 'w-0'
                    }`}
                  ></span>
                </a>
              );
            })}
          </div>
          <p className="text-gray-500 text-lg mt-4 md:mt-0">&copy; 2025 Cloud Hosting. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;