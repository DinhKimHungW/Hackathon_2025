import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// API Base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Methods that are safe to retry (idempotent)
const RETRYABLE_METHODS = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'];

// Status codes that should trigger a retry
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Log request in development
      if (import.meta.env.DEV) {
        console.log('🚀 Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          hasToken: true,
          authHeader: 'Bearer ***',
        });
      }
    } else {
      console.warn('⚠️ No access_token found in localStorage');
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { 
      _retry?: boolean;
      _retryCount?: number;
    };

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('❌ Response Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        retryCount: originalRequest._retryCount || 0,
      });
    }

    // Initialize retry count
    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    // Check if request should be retried
    const shouldRetry =
      originalRequest &&
      !originalRequest._retry &&
      originalRequest._retryCount < MAX_RETRIES &&
      RETRYABLE_METHODS.includes(originalRequest.method?.toUpperCase() || '') &&
      (error.code === 'ECONNABORTED' || // Timeout
       error.code === 'ERR_NETWORK' || // Network error
       (error.response?.status && RETRYABLE_STATUS_CODES.includes(error.response.status)));

    // Retry logic for network errors and specific status codes
    if (shouldRetry) {
      originalRequest._retryCount++;
      const delay = RETRY_DELAY * Math.pow(2, originalRequest._retryCount - 1); // Exponential backoff

      console.warn(`⏳ Retrying request (${originalRequest._retryCount}/${MAX_RETRIES}) after ${delay}ms...`);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      return axiosInstance(originalRequest);
    }

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear all auth data and redirect to login
      console.warn('⚠️ 401 Unauthorized - Token expired, redirecting to login...');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      console.error('🚫 Access Forbidden:', error.response.data);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('🔍 Resource Not Found:', error.config?.url);
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('💥 Server Error:', error.response.data);
    }

    // Handle Network Errors
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error: Please check your internet connection');
    }

    // Handle Timeout Errors
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request Timeout: Server took too long to respond');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

// Export API URL for other uses
export { API_URL };
