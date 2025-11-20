// frontend/src/utils/api.js
import axios from 'axios';

// Get API URL from environment or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 API Base URL:', API_URL);

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('📤 Request to:', config.baseURL + config.url);
  return config;
});

// Log responses
API.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default API;