import api from './api';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/api/auth/login', credentials);
    return res;
  },

  register: async (userData) => {
    const res = await api.post('/api/auth/register', userData);
    return res;
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('flowra_token');
      localStorage.removeItem('flowra_user');
    }
  },

  getCurrentUser: async () => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },
};
