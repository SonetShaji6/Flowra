import api from './api';

export const projectService = {
  getProjects: async (params = {}) => {
    const res = await api.get('/api/projects', { params });
    return res.data;
  },

  getProjectById: async (id) => {
    const res = await api.get(`/api/projects/${id}`);
    return res.data;
  },

  createProject: async (projectData) => {
    const res = await api.post('/api/projects', projectData);
    return res.data;
  },

  updateProject: async (id, projectData) => {
    const res = await api.patch(`/api/projects/${id}`, projectData);
    return res.data;
  },

  deleteProject: async (id) => {
    const res = await api.delete(`/api/projects/${id}`);
    return res;
  },

  getMembers: async (projectId) => {
    const res = await api.get(`/api/projects/${projectId}/members`);
    return res.data;
  },

  addMember: async (projectId, userId) => {
    const res = await api.post(`/api/projects/${projectId}/members`, { userId });
    return res.data;
  },

  removeMember: async (projectId, userId) => {
    const res = await api.delete(`/api/projects/${projectId}/members/${userId}`);
    return res;
  },
};
