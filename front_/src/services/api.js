import axios from 'axios';
import { toast } from 'react-toastify';
import { setApiInterceptorLogout, apiInterceptorLogout } from '../contexts/AuthContext'; 

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
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

// Response interceptor to handle errors, especially 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check if the error is 401 and it's not a retry (to prevent infinite loops)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried
      
      // Call the globally registered logout function
      apiInterceptorLogout();
      toast.error('Sua sessão expirou. Por favor, faça login novamente.', { autoClose: 3000 });
    }
    return Promise.reject(error);
  }
);

export default api;
