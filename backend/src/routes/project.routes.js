const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  projectCreateSchema,
  projectUpdateSchema,
  memberAddSchema,
} = require('../validators/project.validator');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} = require('../controllers/project.controller');

const router = express.Router();

// Project CRUD
router.get('/', protect, getProjects);
router.post('/', protect, authorize('ADMIN', 'PROJECT_MANAGER'), validate(projectCreateSchema), createProject);
router.get('/:id', protect, getProject);
router.put('/:id', protect, authorize('ADMIN', 'PROJECT_MANAGER'), validate(projectUpdateSchema), updateProject);
router.patch('/:id', protect, authorize('ADMIN', 'PROJECT_MANAGER'), validate(projectUpdateSchema), updateProject);
router.delete('/:id', protect, authorize('ADMIN', 'PROJECT_MANAGER'), deleteProject);

// Team & Member Management
router.get('/:id/members', protect, getProjectMembers);
router.get('/:projectId/members', protect, getProjectMembers);
router.post('/:id/members', protect, authorize('ADMIN', 'PROJECT_MANAGER'), validate(memberAddSchema), addProjectMember);
router.post('/:projectId/members', protect, authorize('ADMIN', 'PROJECT_MANAGER'), validate(memberAddSchema), addProjectMember);
router.delete('/:id/members/:userId', protect, authorize('ADMIN', 'PROJECT_MANAGER'), removeProjectMember);
router.delete('/:projectId/members/:userId', protect, authorize('ADMIN', 'PROJECT_MANAGER'), removeProjectMember);

module.exports = router;
