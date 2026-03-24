import { create } from 'zustand';
import storage from '../utils/storage';
import authService from '../services/authService';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  // Initialize — check if token exists on app start
  initialize: async () => {
    const token = await storage.getToken();
    const user = await storage.getUser();
    if (token && user) {
      set({ token, user, isAuthenticated: true });
    }
  },

  // Login
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authService.login(email, password);
      await storage.setToken(data.token);
      await storage.setUser(data.user);
      set({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      const message = err.response?.data?.message || 'Login failed.';
      return { success: false, message };
    }
  },

  // Register
  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const data = await authService.register(username, email, password);
      await storage.setToken(data.token);
      await storage.setUser(data.user);
      set({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      const message = err.response?.data?.message || 'Registration failed.';
      return { success: false, message };
    }
  },

  // Logout
  logout: async () => {
    try {
      await authService.logout();
    } catch (err) {
      // ignore error
    }
    await storage.clear();
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Update user data (after profile edit, XP gain etc.)
  updateUser: (updatedUser) => {
    set((state) => ({
      user: { ...state.user, ...updatedUser }
    }));
    storage.setUser({ ...useAuthStore.getState().user, ...updatedUser });
  },

}));

export default useAuthStore;