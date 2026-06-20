// API Configuration
const getApiUrl = () => {
  // Always use the Render backend (works for both dev and production)
  return 'https://dts-backend-8oqr.onrender.com/api';
};

const config = {
  apiUrl: getApiUrl()
};

export default config;
