const express = require('express');
const {
  getMyProfile,
  updateMyProfile,
  updateMyPassword,
  getUsers,
  getUser,
  updateUserStatus,
  updateUserRole,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  profileUpdateSchema,
  passwordSchema,
  roleUpdateSchema,
  statusUpdateSchema,
} = require('../validators/user.validator');

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.patch('/me', protect, validate(profileUpdateSchema), updateMyProfile);
router.patch('/me/password', protect, validate(passwordSchema), updateMyPassword);

// User directory
router.get('/', protect, getUsers);
router.get('/:id', protect, getUser);
router.patch('/:id/status', protect, authorize('ADMIN'), validate(statusUpdateSchema), updateUserStatus);
router.patch('/:id/role', protect, authorize('ADMIN'), validate(roleUpdateSchema), updateUserRole);

module.exports = router;
