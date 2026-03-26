import api from './api';

const leaderboardService = {

  getGlobal: async () => {
    const response = await api.get('/leaderboard/global');
    return response.data;
  },

  getFriends: async () => {
    const response = await api.get('/leaderboard/friends');
    return response.data;
  },

};

export default leaderboardService;