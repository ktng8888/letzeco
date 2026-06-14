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

// Attach the saved auth token to every request.
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

// Clear expired or invalid sessions so navigation returns to login.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if ((status === 401 || status === 403) && !error.config?._handledAuthError) {
      error.config._handledAuthError = true;
      const { clearSession } = require('../store/authStore').default.getState();
      await clearSession();
    }
    return Promise.reject(error);
  }
);

export default api;
