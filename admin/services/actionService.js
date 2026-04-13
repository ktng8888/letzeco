import api from './api';

const actionService = {
  getAll: async () => (await api.get('/admin/actions')).data,
  getById: async (id) => (await api.get(`/admin/actions/${id}`)).data,

  create: async (formData) => {
    const res = await api.post('/admin/actions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  update: async (id, formData) => {
    const res = await api.put(`/admin/actions/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  delete: async (id) => (await api.delete(`/admin/actions/${id}`)).data,
};

export default actionService;