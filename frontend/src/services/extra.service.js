import api from './api';

export const aiService = {
  generateTasks: async (data) => {
    const res = await api.post('/api/ai/generate-tasks', data);
    return res.data || res;
  },

  breakdownTask: async (data) => {
    const res = await api.post('/api/ai/breakdown-task', data);
    return res.data || res;
  },

  getProjectSummary: async (projectId) => {
    const res = await api.post('/api/ai/project-summary', { projectId });
    return res.data || res;
  },

  getRiskAnalysis: async (projectId) => {
    const res = await api.post('/api/ai/risk-analysis', { projectId });
    return res.data || res;
  },
};

export const analyticsService = {
  getOverview: async () => {
    const res = await api.get('/api/analytics/overview');
    return res.data || res;
  },

  getProjectAnalytics: async (projectId) => {
    const res = await api.get(`/api/analytics/projects/${projectId}`);
    return res.data || res;
  },

  getTeamAnalytics: async () => {
    const res = await api.get('/api/analytics/team');
    return res.data || res;
  },
};

export const adminService = {
  getStatistics: async () => {
    const res = await api.get('/api/admin/statistics');
    return res.data || res;
  },

  getUsers: async (params = {}) => {
    const res = await api.get('/api/admin/users', { params });
    return res.data || res;
  },

  getProjects: async () => {
    const res = await api.get('/api/admin/projects');
    return res.data || res;
  },

  getActivities: async () => {
    const res = await api.get('/api/admin/activities');
    return res.data || res;
  },

  updateUserStatus: async (userId, isActive) => {
    const res = await api.patch(`/api/users/${userId}/status`, { isActive });
    return res.data || res;
  },

  updateUserRole: async (userId, role) => {
    const res = await api.patch(`/api/users/${userId}/role`, { role });
    return res.data || res;
  },
};

export const userService = {
  getMyProfile: async () => {
    const res = await api.get('/api/users/me');
    return res.data || res;
  },

  updateMyProfile: async (data) => {
    const res = await api.patch('/api/users/me', data);
    return res.data || res;
  },

  updateMyPassword: async (data) => {
    const res = await api.patch('/api/users/me/password', data);
    return res;
  },

  getUsers: async (params = {}) => {
    const res = await api.get('/api/users', { params });
    return res.data || res;
  },
};

export const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/api/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data || res;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/api/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data || res;
  },

  uploadAttachment: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/api/upload/attachment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data || res;
  },

  deleteFile: async (publicId) => {
    const res = await api.delete(`/api/upload/${encodeURIComponent(publicId)}`);
    return res.data || res;
  },
};

