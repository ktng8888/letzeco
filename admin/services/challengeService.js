import api from './api';
const challengeService = {
  getAll: async () => (await api.get('/admin/challenges')).data,

  getById: async (id) => (await api.get(`/admin/challenges/${id}`)).data,
  
  create: async (formData) => {
    const res = await api.post('/admin/challenges', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  update: async (id, formData) => {
    const res = await api.put(`/admin/challenges/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  delete: async (id) => (await api.delete(`/admin/challenges/${id}`)).data,

  getEligibleActions: async (id) =>
    (await api.get(`/admin/challenges/${id}/eligible-actions`)).data,

  addEligibleAction: async (id, actionId) =>
    (await api.post(`/admin/challenges/${id}/eligible-actions`, {
      action_id: actionId
    })).data,

  removeEligibleAction: async (challengeId, eligibleActionId) =>
    (await api.delete(
      `/admin/challenges/${challengeId}/eligible-actions/${eligibleActionId}`
    )).data,
};
export default challengeService;