import api from './api';

export const commentService = {
  getComments: async (params = {}) => {
    const res = await api.get('/api/comments', { params });
    return res.data;
  },

  createComment: async (commentData) => {
    const res = await api.post('/api/comments', commentData);
    return res.data;
  },

  updateComment: async (id, content) => {
    const res = await api.patch(`/api/comments/${id}`, { content });
    return res.data;
  },

  deleteComment: async (id) => {
    const res = await api.delete(`/api/comments/${id}`);
    return res;
  },
};

export const notificationService = {
  getNotifications: async () => {
    const res = await api.get('/api/notifications');
    return res.data;
  },

  markRead: async (id) => {
    const res = await api.patch(`/api/notifications/${id}/read`);
    return res.data;
  },

  markAllRead: async () => {
    const res = await api.patch('/api/notifications/read-all');
    return res;
  },

  deleteNotification: async (id) => {
    const res = await api.delete(`/api/notifications/${id}`);
    return res;
  },
};

export const activityService = {
  getActivities: async () => {
    const res = await api.get('/api/activities');
    return res.data;
  },

  getProjectActivities: async (projectId) => {
    const res = await api.get(`/api/activities/project/${projectId}`);
    return res.data;
  },
};
