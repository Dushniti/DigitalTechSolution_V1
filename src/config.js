// API Configuration
const getApiUrl = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const hostname = window.location.hostname;
  
  if (isProd) {
    // Use the same domain as the frontend in production
    return `${window.location.protocol}//${hostname}/api`;
  }
  
  // Development URL
  return 'http://localhost:3000/api';
};

const config = {
  apiUrl: getApiUrl()
};

export default config;
