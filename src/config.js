// API Configuration
const config = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://digitaltechsolution.in/api'  // Production URL
    : 'http://localhost:3000/api'           // Development URL
};

export default config;
