import api from './api';

export const taskService = {
  getTasks: async (params = {}) => {
    const res = await api.get('/api/tasks', { params });
    return res.data;
  },

  getTaskById: async (id) => {
    const res = await api.get(`/api/tasks/${id}`);
    return res.data;
  },

  createTask: async (taskData) => {
    const res = await api.post('/api/tasks', taskData);
    return res.data;
  },

  updateTask: async (id, taskData) => {
    const res = await api.patch(`/api/tasks/${id}`, taskData);
    return res.data;
  },

  updateTaskStatus: async (id, status) => {
    const res = await api.patch(`/api/tasks/${id}/status`, { status });
    return res.data;
  },

  deleteTask: async (id) => {
    const res = await api.delete(`/api/tasks/${id}`);
    return res;
  },
};
