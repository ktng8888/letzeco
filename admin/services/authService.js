import api from './api';

const authService = {
  login: async (email, password) => {
    const res = await api.post('/admin/auth/login', { email, password });
    return res.data;
  },
  forgotPassword: async (email) => {
    const res = await api.post('/admin/auth/forgot-password', { email });
    return res.data;
  },
  validateOtp: async (email, otp) => {
    const res = await api.post('/admin/auth/validate-otp', { email, otp });
    return res.data;
  },
  resetPassword: async (email, otp, newPassword) => {
    const res = await api.post('/admin/auth/reset-password', {
      email, otp, newPassword
    });
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/admin/auth/logout');
    return res.data;
  },

  //Admin get and update profile
  getMyProfile: async () => {
    const res = await api.get('/admin/auth/me');
    return res.data;
  },
  updateMyProfile: async (data) => {
    const res = await api.put('/admin/auth/me', data);
    return res.data;
  },
  uploadMyProfilePicture: async (formData) => {
    const res = await api.put('/admin/auth/me/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  changeMyPassword: async (currentPassword, newPassword) => {
    const res = await api.put('/admin/auth/me/password', {
      currentPassword, newPassword
    });
    return res.data;
  },
};
export default authService;