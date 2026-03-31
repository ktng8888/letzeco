import api from './api';
const challengeService = {
  getAll: async () => (await api.get('/admin/challenges')).data,
  getById: async (id) => (await api.get(`/admin/challenges/${id}`)).data,
  create: async (data) => (await api.post('/admin/challenges', data)).data,
  update: async (id, data) => (await api.put(`/admin/challenges/${id}`, data)).data,
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