import api from './api';
const achievementService = {
  getAll: async () => (await api.get('/admin/achievements')).data,
  getById: async (id) => (await api.get(`/admin/achievements/${id}`)).data,
  create: async (data) => (await api.post('/admin/achievements', data)).data,
  update: async (id, data) =>
    (await api.put(`/admin/achievements/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/admin/achievements/${id}`)).data,
};
export default achievementService;