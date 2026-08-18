const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { sendResponse } = require('../utils/response');
const { calculateProjectProgress } = require('../utils/projectProgress');
const { createActivity, createNotification } = require('../utils/activity');

const ensureProjectAccess = async (projectId, userId, role) => {
  const project = await Project.findById(projectId);

  if (!project) {
    return { project: null, allowed: false, isManagerOrAdmin: false };
  }

  if (role === 'ADMIN') {
    return { project, allowed: true, isManagerOrAdmin: true };
  }

  const isManager = project.manager.toString() === userId.toString();
  const isMember = project.members.some((memberId) => memberId.toString() === userId.toString());

  return {
    project,
    allowed: isManager || isMember,
    isManagerOrAdmin: isManager,
  };
};

const refreshProjectProgress = async (projectId) => {
  const tasks = await Task.find({ project: projectId });
  const progress = calculateProjectProgress(tasks);

  await Project.findByIdAndUpdate(projectId, { progress }, { new: true });
  return progress;
};

const getTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedTo, project, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (project) filter.project = project;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (req.user.role !== 'ADMIN') {
      const visibleProjects = await Project.find({
        $or: [
          { manager: req.user.id },
          { members: req.user.id },
        ],
      }).select('_id');

      const projectIds = visibleProjects.map((item) => item._id);
      filter.project = filter.project ? { $in: [filter.project].filter(p => projectIds.some(pid => pid.toString() === p.toString())) } : { $in: projectIds };
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name status progress')
      .populate('assignedTo', 'name email role profileImage')
      .populate('createdBy', 'name email role profileImage')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, true, 'Tasks retrieved successfully', tasks);
  } catch (error) {
    return next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status manager members')
      .populate('assignedTo', 'name email role profileImage')
      .populate('createdBy', 'name email role profileImage');

    if (!task) {
      return sendResponse(res, 404, false, 'Task not found');
    }

    const { project, allowed } = await ensureProjectAccess(
      task.project._id || task.project,
      req.user.id,
      req.user.role
    );

    if (!project || !allowed) {
      return sendResponse(res, 403, false, 'You are not authorized to access this task');
    }

    return sendResponse(res, 200, true, 'Task retrieved successfully', task);
  } catch (error) {
    return next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { project: projectId, title, description, assignedTo, priority, status, deadline, subtasks } = req.body;

    if (!projectId) {
      return sendResponse(res, 400, false, 'Project ID is required');
    }

    const { project, allowed } = await ensureProjectAccess(projectId, req.user.id, req.user.role);
    if (!project || !allowed) {
      return sendResponse(res, 403, false, 'You are not authorized to create tasks in this project');
    }

    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser || !assignedUser.isActive) {
        return sendResponse(res, 400, false, 'Assigned user is invalid or inactive');
      }

      const isAssignedMember = project.members.some((memberId) => memberId.toString() === assignedTo.toString())
        || project.manager.toString() === assignedTo.toString();

      if (!isAssignedMember) {
        return sendResponse(res, 400, false, 'Assigned user must be a member or manager of the project');
      }
    }

    const task = await Task.create({
      project: projectId,
      title,
      description: description || '',
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
      priority: priority || 'MEDIUM',
      status: status || 'TODO',
      deadline: deadline || null,
      subtasks: subtasks || [],
    });

    await refreshProjectProgress(projectId);

    await createActivity({
      projectId,
      userId: req.user.id,
      action: 'TASK_CREATED',
      entityType: 'TASK',
      entityId: task._id,
      details: { title: task.title, priority: task.priority },
    });

    if (assignedTo && assignedTo.toString() !== req.user.id.toString()) {
      await createNotification({
        recipient: assignedTo,
        sender: req.user.id,
        type: 'ASSIGNMENT',
        title: 'Task assigned',
        message: `You were assigned to task "${task.title}" in project "${project.name}"`,
        relatedProject: projectId,
        relatedTask: task._id,
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name status progress')
      .populate('assignedTo', 'name email role profileImage')
      .populate('createdBy', 'name email role profileImage');

    return sendResponse(res, 201, true, 'Task created successfully', populatedTask);
  } catch (error) {
    return next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendResponse(res, 404, false, 'Task not found');
    }

    const { project, allowed, isManagerOrAdmin } = await ensureProjectAccess(task.project, req.user.id, req.user.role);
    if (!project || !allowed) {
      return sendResponse(res, 403, false, 'You are not authorized to update this task');
    }

    const { assignedTo, status, priority, title, description, deadline, subtasks } = req.body;
    const oldAssignee = task.assignedTo ? task.assignedTo.toString() : null;

    if (assignedTo !== undefined) {
      if (assignedTo && !isManagerOrAdmin && req.user.id.toString() !== task.createdBy.toString()) {
        return sendResponse(res, 403, false, 'Only project managers or admins can reassign tasks');
      }

      if (assignedTo) {
        const assignedUser = await User.findById(assignedTo);
        if (!assignedUser || !assignedUser.isActive) {
          return sendResponse(res, 400, false, 'Assigned user is invalid or inactive');
        }
        const isMember = project.members.some((memberId) => memberId.toString() === assignedTo.toString())
          || project.manager.toString() === assignedTo.toString();
        if (!isMember) {
          return sendResponse(res, 400, false, 'Assigned user must be a project member');
        }
        task.assignedTo = assignedTo;
      } else {
        task.assignedTo = null;
      }
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (deadline !== undefined) task.deadline = deadline;
    if (subtasks !== undefined) task.subtasks = subtasks;

    await task.save();
    await refreshProjectProgress(task.project);

    await createActivity({
      projectId: task.project,
      userId: req.user.id,
      action: task.status === 'COMPLETED' ? 'TASK_COMPLETED' : 'TASK_UPDATED',
      entityType: 'TASK',
      entityId: task._id,
      details: { title: task.title, status: task.status },
    });

    if (assignedTo && assignedTo.toString() !== oldAssignee && assignedTo.toString() !== req.user.id.toString()) {
      await createNotification({
        recipient: assignedTo,
        sender: req.user.id,
        type: 'ASSIGNMENT',
        title: 'Task assignment updated',
        message: `You were assigned to task: ${task.title}`,
        relatedProject: task.project,
        relatedTask: task._id,
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name status progress')
      .populate('assignedTo', 'name email role profileImage')
      .populate('createdBy', 'name email role profileImage');

    return sendResponse(res, 200, true, 'Task updated successfully', populatedTask);
  } catch (error) {
    return next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendResponse(res, 404, false, 'Task not found');
    }

    const { project, isManagerOrAdmin } = await ensureProjectAccess(task.project, req.user.id, req.user.role);
    if (!project || (!isManagerOrAdmin && req.user.id.toString() !== task.createdBy.toString())) {
      return sendResponse(res, 403, false, 'You are not authorized to delete this task');
    }

    const projectId = task.project;
    const taskTitle = task.title;
    await task.deleteOne();
    await refreshProjectProgress(projectId);

    await createActivity({
      projectId,
      userId: req.user.id,
      action: 'TASK_DELETED',
      entityType: 'TASK',
      entityId: req.params.id,
      details: { title: taskTitle },
    });

    return sendResponse(res, 200, true, 'Task deleted successfully');
  } catch (error) {
    return next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return sendResponse(res, 400, false, 'Task status is required');
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return sendResponse(res, 404, false, 'Task not found');
    }

    const { project, allowed } = await ensureProjectAccess(task.project, req.user.id, req.user.role);
    if (!project || !allowed) {
      return sendResponse(res, 403, false, 'You are not authorized to update this task status');
    }

    task.status = status;
    await task.save();
    await refreshProjectProgress(task.project);

    await createActivity({
      projectId: task.project,
      userId: req.user.id,
      action: status === 'COMPLETED' ? 'TASK_COMPLETED' : 'TASK_STATUS_CHANGED',
      entityType: 'TASK',
      entityId: task._id,
      details: { title: task.title, status },
    });

    // Notify project manager if a team member changes status
    const managerId = (project.manager._id || project.manager).toString();
    if (managerId !== req.user.id.toString()) {
      await createNotification({
        recipient: managerId,
        sender: req.user.id,
        type: 'TASK_UPDATE',
        title: 'Task status updated',
        message: `${req.user.name || 'A team member'} changed status of "${task.title}" to ${status}`,
        relatedProject: task.project,
        relatedTask: task._id,
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name status progress')
      .populate('assignedTo', 'name email role profileImage')
      .populate('createdBy', 'name email role profileImage');

    return sendResponse(res, 200, true, 'Task status updated successfully', populatedTask);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
};
