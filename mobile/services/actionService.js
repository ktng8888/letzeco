import api from './api';

const actionService = {

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getTodayActions: async () => {
    const response = await api.get('/user-actions/today');
    return response.data;
  },

  getPopular: async () => {
    const response = await api.get('/actions/popular');
    return response.data;
  },

};

export default actionService;