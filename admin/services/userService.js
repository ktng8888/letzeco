import api from './api';
const userService = {
  getAll: async () => (await api.get('/admin/users')).data,
  getById: async (id) => (await api.get(`/admin/users/${id}`)).data,
  create: async (data) => (await api.post('/admin/users', data)).data,
  update: async (id, data) => (await api.put(`/admin/users/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/admin/users/${id}`)).data,
};
export default userService;