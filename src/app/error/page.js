import React from 'react';

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* SVG illustration of a broken robot */}
        <div className="mx-auto w-48 h-48 mb-6">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Robot Head */}
            <rect x="60" y="30" width="80" height="70" rx="10" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="2"/>
            
            {/* Robot Eyes */}
            <circle cx="85" cy="60" r="10" fill="#FBBF24"/>
            <circle cx="115" cy="60" r="10" fill="#FBBF24"/>
            <circle cx="85" cy="60" r="5" fill="#1E3A8A"/>
            <circle cx="115" cy="60" r="5" fill="#1E3A8A"/>
            
            {/* Broken Antenna */}
            <line x1="100" y1="30" x2="110" y2="15" stroke="#6B7280" strokeWidth="4" strokeLinecap="round"/>
            <line x1="110" y1="15" x2="120" y2="20" stroke="#6B7280" strokeWidth="4" strokeLinecap="round"/>
            
            {/* Robot Mouth - X shape for error */}
            <line x1="80" y1="85" x2="120" y2="85" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
            <line x1="85" y1="80" x2="85" y2="90" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
            <line x1="100" y1="80" x2="100" y2="90" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
            <line x1="115" y1="80" x2="115" y2="90" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
            
            {/* Robot Body */}
            <rect x="70" y="100" width="60" height="50" rx="5" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="2"/>
            
            {/* Body Details */}
            <circle cx="85" cy="115" r="5" fill="#10B981"/>
            <circle cx="85" cy="135" r="5" fill="#EF4444"/>
            <rect x="100" y="110" width="20" height="30" rx="2" fill="#1E3A8A"/>
            <line x1="105" y1="115" x2="115" y2="115" stroke="#10B981" strokeWidth="2"/>
            <line x1="105" y1="120" x2="115" y2="120" stroke="#FBBF24" strokeWidth="2"/>
            <line x1="105" y1="125" x2="115" y2="125" stroke="#FBBF24" strokeWidth="2"/>
            <line x1="105" y1="130" x2="115" y2="130" stroke="#EF4444" strokeWidth="2"/>
            
            {/* Broken Parts */}
            <circle cx="50" cy="140" r="8" fill="#6B7280"/>
            <circle cx="150" cy="120" r="6" fill="#6B7280"/>
            <line x1="130" y1="100" x2="145" y2="90" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" strokeDasharray="2,2"/>
            
            {/* Lightning Bolt */}
            <path d="M40,60 L50,45 L45,60 L55,50 Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
          </svg>
        </div>
        
        {/* Error Text */}
        <h1 className="text-3xl md:text-4xl font-bold text-red-500 mb-2">404: Page Not Found</h1>
        <p className="text-lg text-gray-300 mb-6">Oops! It seems our circuits couldn&apos;t locate the page you&apos;re looking for.</p>
        
        {/* Helpful Message */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
          <p className="text-gray-300">The page might have been moved, deleted, or never existed. Or maybe it&apos;s just hiding really well.</p>
        </div>
        
        {/* Action Button */}
        <button 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300"
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
        
        <div className="mt-4">
          <link href="/" className="text-blue-400 hover:text-blue-300 transition-colors duration-300">
            Return to Homepage
        </link>
        </div>
      </div>
    </div>
  );
}