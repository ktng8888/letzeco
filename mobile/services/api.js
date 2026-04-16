import axios from 'axios';
import storage from '../utils/storage';
import API_BASE_URL from '../constants/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear storage
      await storage.clear();
      // Force logout via auth store
      const { logout } = require('../store/authStore').default.getState();
      await logout();
    }
    return Promise.reject(error);
  }
);

export default api;