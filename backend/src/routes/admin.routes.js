const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const AIInteraction = require('../models/AIInteraction');
const { sendResponse } = require('../utils/response');

const router = express.Router();

// System Statistics & Health
const getSystemStatistics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      totalActivities,
      totalAIInteractions,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      Project.countDocuments(),
      Project.countDocuments({ status: { $in: ['PLANNING', 'ACTIVE'] } }),
      Project.countDocuments({ status: 'COMPLETED' }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'COMPLETED' }),
      Activity.countDocuments(),
      AIInteraction.countDocuments(),
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    return sendResponse(res, 200, true, 'System statistics retrieved successfully', {
      status: 'healthy',
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole: usersByRole.map(r => ({ role: r._id, count: r.count })),
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
      },
      system: {
        totalActivities,
        totalAIInteractions,
        nodeEnv: process.env.NODE_ENV || 'development',
        serverTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Admin User Directory
const getAdminUsers = async (req, res, next) => {
  try {
    const { role, isActive, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    return sendResponse(res, 200, true, 'Admin users retrieved successfully', users);
  } catch (error) {
    return next(error);
  }
};

// Admin System Projects
const getAdminProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('manager', 'name email role')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, true, 'Admin projects retrieved successfully', projects);
  } catch (error) {
    return next(error);
  }
};

// Admin System Activities
const getAdminActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find()
      .populate('user', 'name email role')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    return sendResponse(res, 200, true, 'Admin system activities retrieved successfully', activities);
  } catch (error) {
    return next(error);
  }
};

router.get('/statistics', protect, authorize('ADMIN'), getSystemStatistics);
router.get('/system-health', protect, authorize('ADMIN'), getSystemStatistics);
router.get('/users', protect, authorize('ADMIN'), getAdminUsers);
router.get('/projects', protect, authorize('ADMIN'), getAdminProjects);
router.get('/activities', protect, authorize('ADMIN'), getAdminActivities);

module.exports = router;
