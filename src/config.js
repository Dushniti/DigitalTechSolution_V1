// API Configuration
const getApiUrl = () => {
  if (window.location.hostname === 'digitaltechsolution.in' || 
      window.location.hostname === 'www.digitaltechsolution.in') {
    // Production URL - use the backend server directly
    return 'https://api.digitaltechsolution.in';
  }
  
  // Development URL
  return 'http://localhost:3000';
};

const config = {
  apiUrl: getApiUrl()
};

export default config;
