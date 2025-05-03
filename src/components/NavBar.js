'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';

const Navbar = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Check authentication status and update dynamically
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('auth_token');
      console.log('NavBar: Checking auth - auth_token=', token);

      if (token) {
        setIsAuthenticated(true);
        console.log('NavBar: User is authenticated, token=', token);
      } else {
        // Fallback: Try to fetch auth status from an API (optional)
        try {
          const response = await fetch('/api/auth/status', {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
          });
          const data = await response.json();
          console.log('NavBar: Auth status response=', data);
          if (data.isAuthenticated) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('NavBar: Error checking auth status:', error);
          setIsAuthenticated(false);
        }
      }
    };

    // Initial check
    checkAuth();

    // Poll for cookie changes every 2 seconds
    const interval = setInterval(checkAuth, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Base navigation items
  const baseNavItems = [
    { label: "Home", path: "/", id: "home" },
    { label: "Plans", path: "#plans-section", id: "plans" },
    { label: "Auto-Deploy", path: "/AutoDeploy", id: "autodeploy" },
    { label: "Contact", path: "#contact-section", id: "contact" },
  ];

  // Add Dashboard link for authenticated users
  const navItems = isAuthenticated
    ? [...baseNavItems, { label: "Dashboard", path: "/Dashboard", id: "dashboard" }]
    : baseNavItems;

  const handleNavigation = (path) => {
    if (path.startsWith('#')) {
      const element = document.getElementById(path.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(path);
    }
  };

  const handleLogout = () => {
    console.log('NavBar: Logging out');
    Cookies.remove('auth_token');
    setIsAuthenticated(false);
    router.push('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className={`w-full bg-white h-[70px] overflow-hidden text-left text-xl text-black transition-all duration-300 fixed z-[100] ${
        isScrolled ? 'shadow-md' : ''
      }`} style={{ fontFamily: 'var(--font-inter)' }}
    >
      <div className="absolute top-[9px] left-[113px] flex flex-row items-center justify-start gap-2.5">
        <div
          onClick={() => handleNavigation('/')}
          className={`cursor-pointer transition-transform duration-300 ${
            isLogoHovered ? 'scale-110' : ''
          }`}
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          <Image
            className="w-[76px] relative max-h-full overflow-hidden shrink-0"
            width={76}
            height={52}
            alt="Cloud Logo"
            src="/image/Cloud.svg"
          />
        </div>
        <div
          className={`w-[204px] relative font-semibold inline-block h-[29.1px] shrink-0 transition-colors duration-300 ${
            isLogoHovered ? 'text-blue-500' : ''
          }`}
        >
          Cloud Hosting
        </div>
      </div>

      <div className="absolute top-[17px] left-[760px] flex flex-row items-center justify-start gap-10">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white overflow-hidden flex flex-row items-center justify-center p-3xs cursor-pointer transition-all duration-300 ${
              hoveredItem === item.id ? 'scale-110' : ''
            }`}
            onClick={() => handleNavigation(item.path)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div
              className={`relative font-semibold transition-colors duration-300 ${
                hoveredItem === item.id ? 'text-blue-500' : 'text-black'
              }`}
            >
              {item.label}
              <div
                className={`h-0.5 bg-blue-500 transition-all duration-300 ${
                  hoveredItem === item.id ? 'w-full' : 'w-0'
                }`}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`absolute top-[13px] right-[50px] rounded-[10px] overflow-hidden flex flex-row items-center justify-center py-2.5 px-10 cursor-pointer transition-all duration-300 ${
          isLoginHovered
            ? 'bg-blue-700 shadow-lg'
            : 'bg-gray-900 shadow-[0px_1px_0px_rgba(0,_0,_0,_0.25)]'
        }`}
        onClick={isAuthenticated ? handleLogout : () => handleNavigation('/Login')}
        onMouseEnter={() => setIsLoginHovered(true)}
        onMouseLeave={() => setIsLoginHovered(false)}
      >
        <div className="relative font-semibold text-white transition-all duration-300">
          {isAuthenticated ? 'Logout' : 'Login'}
        </div>
      </div>
    </div>
  );
};

export default Navbar;