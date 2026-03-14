import api from './api';

export const authService = {
  async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data;
  },

  async register(data: { name: string; email: string; password: string; role: string }) {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  },

  async forgotPassword(email: string) {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data.data;
  },

  async verifyOTP(email: string, otp: string) {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data.data;
  },

  async resetPassword(reset_token: string, new_password: string) {
    const res = await api.post('/auth/reset-password', { reset_token, new_password });
    return res.data.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
};
