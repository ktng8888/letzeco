import api from './api';
const dashboardService = {
  get: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },
};
export default dashboardService;