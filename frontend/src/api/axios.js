import axios from 'axios';

/**
 * API Base URL Configuration
 *
 * Local Development:
 *   - Uses VITE_API_BASE_URL from .env.local
 *   - Default: http://localhost:5000/api
 *   - Requests proxied via vite.config.js
 *
 * Production (Vercel):
 *   - Uses VITE_API_BASE_URL from Vercel environment variables
 *   - Value: https://your-backend.onrender.com/api
 *   - Backend URL injected at build time
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
