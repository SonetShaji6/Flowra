const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const aiService = require('../services/ai/ai.service');
const { sendResponse } = require('../utils/response');

const router = express.Router();

router.post('/generate-tasks', protect, async (req, res, next) => {
  try {
    const { projectId, projectName, projectDescription, description, goal } = req.body || {};

    let resolvedProjectName = projectName;
    let existingTasks = [];

    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      const project = await Project.findById(projectId);
      if (project) {
        resolvedProjectName = project.name;
        existingTasks = await Task.find({ project: projectId }).select('title priority status');
      }
    }

    const result = await aiService.generateTasks({
      projectName: resolvedProjectName || 'Project',
      description: projectDescription || description,
      goal: goal || projectDescription || description,
      existingTasks,
      userId: req.user.id,
      projectId: projectId && mongoose.Types.ObjectId.isValid(projectId) ? projectId : null,
    });

    return sendResponse(res, 200, true, 'AI-generated task suggestions ready for review', result);
  } catch (error) {
    return next(error);
  }
});

router.post('/breakdown-task', protect, async (req, res, next) => {
  try {
    const { taskId, title, taskTitle, description, projectContext, projectId } = req.body || {};

    let resolvedTitle = title || taskTitle;
    let resolvedDescription = description;
    let resolvedProjectId = projectId;

    if (taskId && mongoose.Types.ObjectId.isValid(taskId)) {
      const task = await Task.findById(taskId);
      if (task) {
        resolvedTitle = task.title;
        resolvedDescription = task.description || resolvedDescription;
        resolvedProjectId = task.project;
      }
    }

    if (!resolvedTitle) {
      return sendResponse(res, 400, false, 'Task title or taskId is required');
    }

    const result = await aiService.breakdownTask({
      taskTitle: resolvedTitle,
      description: resolvedDescription,
      projectContext,
      userId: req.user.id,
      projectId: resolvedProjectId && mongoose.Types.ObjectId.isValid(resolvedProjectId) ? resolvedProjectId : null,
      taskId: taskId && mongoose.Types.ObjectId.isValid(taskId) ? taskId : null,
    });

    return sendResponse(res, 200, true, 'Task breakdown generated successfully', result);
  } catch (error) {
    return next(error);
  }
});

router.post('/project-summary', protect, async (req, res, next) => {
  try {
    const { projectId } = req.body;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return sendResponse(res, 400, false, 'A valid Project ID is required');
    }

    const project = await Project.findById(projectId).populate('manager', 'name email');
    if (!project) {
      return sendResponse(res, 404, false, 'Project not found');
    }

    const [tasks, activities] = await Promise.all([
      Task.find({ project: projectId }).populate('assignedTo', 'name email'),
      Activity.find({ project: projectId }).sort({ createdAt: -1 }).limit(10),
    ]);

    const result = await aiService.generateProjectSummary({
      project,
      tasks,
      activities,
      userId: req.user.id,
    });

    return sendResponse(res, 200, true, 'Project summary generated successfully', result);
  } catch (error) {
    return next(error);
  }
});

router.post('/risk-analysis', protect, async (req, res, next) => {
  try {
    const { projectId } = req.body;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return sendResponse(res, 400, false, 'A valid Project ID is required');
    }

    const project = await Project.findById(projectId).populate('members', 'name email');
    if (!project) {
      return sendResponse(res, 404, false, 'Project not found');
    }

    const tasks = await Task.find({ project: projectId });

    const result = await aiService.analyzeRisks({
      project,
      tasks,
      members: project.members || [],
      userId: req.user.id,
    });

    return sendResponse(res, 200, true, 'AI risk analysis completed successfully', result);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
