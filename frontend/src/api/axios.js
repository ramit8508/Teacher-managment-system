import axios from 'axios';

// Determine the base URL based on environment
const getBaseURL = () => {
  // Check if VITE_API_URL is defined in environment variables
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  console.log('🔍 Environment Check:', {
    VITE_API_URL: envApiUrl,
    PROD: import.meta.env.PROD,
    MODE: import.meta.env.MODE
  });
  
  if (envApiUrl) {
    console.log('✅ Using VITE_API_URL:', envApiUrl);
    return envApiUrl;
  }
  
  // For production without env variable, you MUST set VITE_API_URL in Vercel
  if (import.meta.env.PROD) {
    console.error('⚠️ VITE_API_URL not set! Please add it in Vercel environment variables');
    return '/api/v1'; // This will fail in production
  }
  
  // For local development, use proxy
  console.log('🏠 Using local proxy: /api/v1');
  return '/api/v1';
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
