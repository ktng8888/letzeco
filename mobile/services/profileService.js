import api from './api';

const profileService = {

  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateUsername: async (username) => {
    const response = await api.put('/user/profile/username', { username });
    return response.data;
  },

  updateEmail: async (email) => {
    const response = await api.put('/user/profile/email', { email });
    return response.data;
  },

  uploadProfilePicture: async (imageUri) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });
    const response = await api.put(
      '/user/profile/picture',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/user/password', {
      currentPassword, newPassword
    });
    return response.data;
  },

  savePushToken: async (pushToken) => {
    const response = await api.post('/user/push-token', {
      push_token: pushToken
    });
    return response.data;
  },

  // Achievements & Badges
  getBadges: async () => {
    const response = await api.get('/achievements/badges');
    return response.data;
  },

  getAchievements: async () => {
    const response = await api.get('/achievements');
    return response.data;
  },

  getStreakRewards: async () => {
    const response = await api.get('/achievements/streak-rewards');
    return response.data;
  },

  getFriendBadges: async (userId) => {
    const response = await api.get(`/achievements/badges/${userId}`);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/user/profile/${userId}`);
    return response.data;
  },

  claimStreakReward: async (userStreakRewardId) => {
    const response = await api.post(
      `/achievements/streak-rewards/claim/${userStreakRewardId}`
    );
    return response.data;
},

};

export default profileService;