// admin/services/challengeService.js  (FULL REPLACEMENT)
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

  // ── NEW: Save one reward row (sends multipart because badge image is included)
  saveReward: async (challengeId, formData) => {
    const res = await api.post(
      `/admin/challenges/${challengeId}/rewards`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  },

  // ── NEW: Delete all rewards for a challenge (call before re-saving on update)
  deleteRewards: async (challengeId) =>
    (await api.delete(`/admin/challenges/${challengeId}/rewards`)).data,
};

export default challengeService;