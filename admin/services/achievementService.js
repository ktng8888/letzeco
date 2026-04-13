import api from './api';
const achievementService = {
  getAll: async () => (await api.get('/admin/achievements')).data,

  getById: async (id) => (await api.get(`/admin/achievements/${id}`)).data,
  
  create: async (formData) => {
    const res = await api.post('/admin/achievements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  update: async (id, formData) => {
    const res = await api.put(`/admin/achievements/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  delete: async (id) => (await api.delete(`/admin/achievements/${id}`)).data,
};
export default achievementService;