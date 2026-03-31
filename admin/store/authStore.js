import { create } from 'zustand';
import storage from '../utils/storage';
import authService from '../services/authService';

const useAuthStore = create((set) => ({
  admin: null,
  token: null,
  isAuthenticated: false,

  initialize: () => {
    const token = storage.getToken();
    const admin = storage.getAdmin();
    if (token && admin) {
      set({ token, admin, isAuthenticated: true });
    }
  },

  login: async (email, password) => {
    try {
      const data = await authService.login(email, password);
      storage.setToken(data.token);
      storage.setAdmin(data.admin);
      set({ token: data.token, admin: data.admin, isAuthenticated: true });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed.'
      };
    }
  },

  logout: async () => {
    try { await authService.logout(); } catch {}
    storage.clear();
    set({ admin: null, token: null, isAuthenticated: false });
  },

  updateAdmin: (data) => {
    set((state) => ({ admin: { ...state.admin, ...data } }));
    const current = storage.getAdmin();
    storage.setAdmin({ ...current, ...data });
  },
}));

export default useAuthStore;