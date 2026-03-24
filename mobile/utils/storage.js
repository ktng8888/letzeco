import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = {

  // Save token
  setToken: async (token) => {
    await AsyncStorage.setItem('token', token);
  },

  // Get token
  getToken: async () => {
    return await AsyncStorage.getItem('token');
  },

  // Remove token
  removeToken: async () => {
    await AsyncStorage.removeItem('token');
  },

  // Save user data
  setUser: async (user) => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  },

  // Get user data
  getUser: async () => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Remove user data
  removeUser: async () => {
    await AsyncStorage.removeItem('user');
  },

  // Clear everything (logout)
  clear: async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
  },

};

export default storage;