import api from './api';

const streakService = {
  checkAndResetStreak: async () => {
    const response = await api.post('/streak/check-reset');
    return response.data;
  },
};

export default streakService;