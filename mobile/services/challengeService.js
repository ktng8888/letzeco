import api from './api';

const challengeService = {

  getAll: async () => {
    const response = await api.get('/challenges');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/challenges/${id}`);
    return response.data;
  },

  getMyChallenges: async () => {
    const response = await api.get('/challenges/my');
    return response.data;
  },

  joinSolo: async (id) => {
    const response = await api.post(`/challenges/${id}/join`);
    return response.data;
  },

  leave: async (id) => {
    const response = await api.delete(`/challenges/${id}/leave`);
    return response.data;
  },

  // Teams
  getPublicTeams: async (challengeId) => {
    const response = await api.get(`/teams/public/${challengeId}`);
    return response.data;
  },

  createTeam: async (name, isPrivate, challengeId) => {
    const response = await api.post('/teams', {
      name,
      is_private: isPrivate,
      challenge_id: challengeId,
    });
    return response.data;
  },

  joinPublicTeam: async (teamId) => {
    const response = await api.post(`/teams/join/public/${teamId}`);
    return response.data;
  },

  joinByCode: async (code) => {
    const response = await api.post('/teams/join/code', { code });
    return response.data;
  },

  leaveTeam: async (teamId) => {
    const response = await api.delete(`/teams/${teamId}/leave`);
    return response.data;
  },

};

export default challengeService;