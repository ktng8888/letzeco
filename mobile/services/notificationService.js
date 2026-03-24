import api from './api';

const notificationService = {

  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

};

export default notificationService;