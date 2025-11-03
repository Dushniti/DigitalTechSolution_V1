// API Configuration
const getApiUrl = () => {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (isProd) {
    // Production API URL
    return 'https://digitaltechsolution-v1.onrender.com/api';
  }
  
  // Development URL
  return 'http://localhost:3000/api';
};

const config = {
  apiUrl: getApiUrl()
};

export default config;
