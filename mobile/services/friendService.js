import api from './api';

const friendService = {

  getFriends: async () => {
    const response = await api.get('/friends');
    return response.data;
  },

  getPendingRequests: async () => {
    const response = await api.get('/friends/requests');
    return response.data;
  },

  getSentRequests: async () => {
    const response = await api.get('/friends/sent');
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await api.get(`/friends/search?query=${query}`);
    return response.data;
  },

  sendRequest: async (userId) => {
    const response = await api.post(`/friends/request/${userId}`);
    return response.data;
  },

  approve: async (friendshipId) => {
    const response = await api.put(`/friends/approve/${friendshipId}`);
    return response.data;
  },

  reject: async (friendshipId) => {
    const response = await api.delete(`/friends/reject/${friendshipId}`);
    return response.data;
  },

  cancelRequest: async (friendshipId) => {
    const response = await api.delete(`/friends/cancel/${friendshipId}`);
    return response.data;
  },

  removeFriend: async (friendshipId) => {
    const response = await api.delete(`/friends/remove/${friendshipId}`);
    return response.data;
  },

  getFriendProfile: async (userId) => {
    const response = await api.get(`/friends/${userId}/profile`);
    return response.data;
  },

};

export default friendService;