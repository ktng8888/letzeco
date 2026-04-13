import api from './api';

const categoryService = {
  getAll: async () => (await api.get('/admin/categories')).data,
  getById: async (id) => (await api.get(`/admin/categories/${id}`)).data,

  create: async (formData) => {
    const res = await api.post('/admin/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  update: async (id, formData) => {
    const res = await api.put(`/admin/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  delete: async (id) => (await api.delete(`/admin/categories/${id}`)).data,
};

export default categoryService;