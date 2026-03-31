import api from './api';
const categoryService = {
  getAll: async () => (await api.get('/admin/categories')).data,
  getById: async (id) => (await api.get(`/admin/categories/${id}`)).data,
  create: async (data) => (await api.post('/admin/categories', data)).data,
  update: async (id, data) => (await api.put(`/admin/categories/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/admin/categories/${id}`)).data,
};
export default categoryService;