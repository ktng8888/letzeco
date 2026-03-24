import api from './api';

const userService = {

  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  savePushToken: async (pushToken) => {
    const response = await api.post('/user/push-token', { push_token: pushToken });
    return response.data;
  },

};

export default userService;