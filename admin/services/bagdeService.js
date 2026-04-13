import api from './api';

const badgeService = {
  getAll: async () => (await api.get('/admin/badges')).data,
  getById: async (id) => (await api.get(`/admin/badges/${id}`)).data,

  create: async (formData) => {
    const res = await api.post('/admin/badges', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  update: async (id, formData) => {
    const res = await api.put(`/admin/badges/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  delete: async (id) => (await api.delete(`/admin/badges/${id}`)).data,
};

export default badgeService;