import api from './api';
const dashboardService = {
  get: async (params = {}) => {
    const res = await api.get('/admin/dashboard', { params });
    return res.data;
  },
};
export default dashboardService;
