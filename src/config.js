// API Configuration
const getApiUrl = () => {
  const isProd = import.meta.env.PROD;

  if (isProd) {
    // Production API URL
    return 'https://dts-backend-8oqr.onrender.com/api';
  }

  // In development, use a relative path so Vite's proxy handles it (no CORS)
  return '/api';
};

const config = {
  apiUrl: getApiUrl()
};

export default config;
