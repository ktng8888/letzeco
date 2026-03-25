import api from './api';

const progressService = {

  getProgress: async (period = 'this_week') => {
    const response = await api.get(`/progress?period=${period}`);
    return response.data;
  },

  getCo2Breakdown: async (period = 'this_week') => {
    const response = await api.get(`/progress/co2-breakdown?period=${period}`);
    return response.data;
  },

  getLitreBreakdown: async (period = 'this_week') => {
    const response = await api.get(`/progress/litre-breakdown?period=${period}`);
    return response.data;
  },

  getKwhBreakdown: async (period = 'this_week') => {
    const response = await api.get(`/progress/kwh-breakdown?period=${period}`);
    return response.data;
  },

  getComparison: async () => {
    const response = await api.get('/progress/comparison');
    return response.data;
  },

  getTrend: async () => {
    const response = await api.get('/progress/trend');
    return response.data;
  },

};

export default progressService;