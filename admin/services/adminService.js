import api from './api';
const adminService = {
  getAll: async () => (await api.get('/admin/admins')).data,
  getById: async (id) => (await api.get(`/admin/admins/${id}`)).data,
  create: async (data) => (await api.post('/admin/admins', data)).data,
  update: async (id, data) => (await api.put(`/admin/admins/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/admin/admins/${id}`)).data,
};
export default adminService;