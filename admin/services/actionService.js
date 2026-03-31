import api from './api';
const actionService = {
  getAll: async () => (await api.get('/admin/actions')).data,
  getById: async (id) => (await api.get(`/admin/actions/${id}`)).data,
  create: async (data) => (await api.post('/admin/actions', data)).data,
  update: async (id, data) => (await api.put(`/admin/actions/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/admin/actions/${id}`)).data,
};
export default actionService;