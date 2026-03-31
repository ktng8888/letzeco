import axios from 'axios';
import storage from '../utils/storage';
import API_BASE_URL from '../constants/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      storage.clear();
      if (typeof window !== 'undefined')
        window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;