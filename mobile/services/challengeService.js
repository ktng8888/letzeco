import api from './api';

const challengeService = {

  getAll: async () => {
    const response = await api.get('/challenges');
    return response.data;
  },

  getMyChallenges: async () => {
    const response = await api.get('/challenges/my');
    return response.data;
  },

};

export default challengeService;