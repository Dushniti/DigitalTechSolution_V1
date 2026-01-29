import React, { useState, useEffect } from 'react';

const CallFloat = () => {
  const [isVisible, setIsVisible] = useState(false);
  const phoneNumber = '7983614392'; // Your phone contact number
  
  useEffect(() => {
    // Show the button after the page loads
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  const handleCallClick = () => {
    window.location.href = `tel:+91${phoneNumber}`;
  };

  return (
    <div 
      className={`fixed bottom-24 right-6 z-50 transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
      }`}
    >
      <div className="relative group">
        {/* Tooltip */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Call Now
          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
        </div>
        
        {/* Call Button */}
        <button
          onClick={handleCallClick}
          className="relative bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group animate-pulse hover:animate-none"
          aria-label="Call us now"
        >
          {/* Ripple Effect */}
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
          
          {/* Phone Icon */}
          <div className="relative z-10">
            <svg 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="w-7 h-7"
            >
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </div>
          
          {/* Active Status Indicator */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white animate-pulse">
            <div className="w-full h-full bg-blue-500 rounded-full"></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default CallFloat;