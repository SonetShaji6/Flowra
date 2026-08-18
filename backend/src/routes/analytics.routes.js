const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendResponse } = require('../utils/response');

const router = express.Router();

// Global / Workspace Overview Analytics
const getOverviewAnalytics = async (req, res, next) => {
  try {
    const isRegularUser = req.user.role !== 'ADMIN';
    const projectFilter = isRegularUser
      ? { $or: [{ manager: req.user.id }, { members: req.user.id }] }
      : {};

    const visibleProjects = await Project.find(projectFilter).select('_id');
    const projectIds = visibleProjects.map((p) => p._id);

    const taskFilter = isRegularUser ? { project: { $in: projectIds } } : {};

    const [projectCount, taskCount, userCount, activeProjects, completedProjects, overdueTasks] = await Promise.all([
      Project.countDocuments(projectFilter),
      Task.countDocuments(taskFilter),
      User.countDocuments({ isActive: true }),
      Project.countDocuments({ ...projectFilter, status: { $in: ['PLANNING', 'ACTIVE'] } }),
      Project.countDocuments({ ...projectFilter, status: 'COMPLETED' }),
      Task.countDocuments({
        ...taskFilter,
        deadline: { $lt: new Date() },
        status: { $ne: 'COMPLETED' },
      }),
    ]);

    const taskStatusBreakdown = await Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const taskPriorityBreakdown = await Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const projectStatusBreakdown = await Project.aggregate([
      { $match: projectFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const myTasksCount = await Task.countDocuments({
      assignedTo: req.user.id,
      status: { $ne: 'COMPLETED' },
    });

    const myCompletedTasksCount = await Task.countDocuments({
      assignedTo: req.user.id,
      status: 'COMPLETED',
    });

    return sendResponse(res, 200, true, 'Analytics overview retrieved successfully', {
      overview: {
        totalProjects: projectCount,
        activeProjects,
        completedProjects,
        totalTasks: taskCount,
        overdueTasks,
        totalUsers: userCount,
        myTasks: myTasksCount,
        myCompletedTasks: myCompletedTasksCount,
      },
      taskStatusBreakdown: taskStatusBreakdown.map((item) => ({ status: item._id, count: item.count })),
      taskPriorityBreakdown: taskPriorityBreakdown.map((item) => ({ priority: item._id, count: item.count })),
      projectStatusBreakdown: projectStatusBreakdown.map((item) => ({ status: item._id, count: item.count })),
    });
  } catch (error) {
    return next(error);
  }
};

// Project-Specific Analytics
const getProjectAnalytics = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId)
      .populate('manager', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return sendResponse(res, 404, false, 'Project not found');
    }

    const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'name email role');

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const reviewTasks = tasks.filter((t) => t.status === 'REVIEW').length;
    const todoTasks = tasks.filter((t) => t.status === 'TODO').length;
    const overdueTasks = tasks.filter(
      (t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'COMPLETED'
    ).length;

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Member Workload
    const memberWorkload = (project.members || []).map((member) => {
      const memberTasks = tasks.filter(
        (t) => t.assignedTo && (t.assignedTo._id || t.assignedTo).toString() === member._id.toString()
      );
      return {
        userId: member._id,
        name: member.name,
        email: member.email,
        totalTasks: memberTasks.length,
        completedTasks: memberTasks.filter((t) => t.status === 'COMPLETED').length,
        inProgressTasks: memberTasks.filter((t) => t.status === 'IN_PROGRESS').length,
      };
    });

    const statusDistribution = [
      { name: 'TODO', count: todoTasks },
      { name: 'IN_PROGRESS', count: inProgressTasks },
      { name: 'REVIEW', count: reviewTasks },
      { name: 'COMPLETED', count: completedTasks },
    ];

    const priorityDistribution = [
      { name: 'LOW', count: tasks.filter((t) => t.priority === 'LOW').length },
      { name: 'MEDIUM', count: tasks.filter((t) => t.priority === 'MEDIUM').length },
      { name: 'HIGH', count: tasks.filter((t) => t.priority === 'HIGH').length },
      { name: 'CRITICAL', count: tasks.filter((t) => t.priority === 'CRITICAL').length },
    ];

    return sendResponse(res, 200, true, 'Project analytics retrieved successfully', {
      project: {
        id: project._id,
        name: project.name,
        status: project.status,
        priority: project.priority,
        progress,
      },
      metrics: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        reviewTasks,
        todoTasks,
        overdueTasks,
        completionRate: progress,
      },
      statusDistribution,
      priorityDistribution,
      memberWorkload,
    });
  } catch (error) {
    return next(error);
  }
};

// Team Workload Analytics
const getTeamAnalytics = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true }).select('name email role');
    const tasks = await Task.find({ status: { $ne: 'COMPLETED' } }).populate('assignedTo', 'name email');

    const workload = users.map((user) => {
      const activeTasks = tasks.filter(
        (t) => t.assignedTo && (t.assignedTo._id || t.assignedTo).toString() === user._id.toString()
      );
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedTasksCount: activeTasks.length,
      };
    });

    return sendResponse(res, 200, true, 'Team workload analytics retrieved successfully', workload);
  } catch (error) {
    return next(error);
  }
};

router.get('/dashboard', protect, getOverviewAnalytics);
router.get('/overview', protect, getOverviewAnalytics);
router.get('/projects/:id', protect, getProjectAnalytics);
router.get('/team/:id', protect, getTeamAnalytics);
router.get('/team', protect, getTeamAnalytics);

module.exports = router;
