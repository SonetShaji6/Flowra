const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { sendResponse } = require('../utils/response');
const { createActivity, createNotification } = require('../utils/activity');

const ensureCommentAccess = async (projectId, reqUser) => {
  if (reqUser.role === 'ADMIN') {
    return true;
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return false;
  }

  return (
    (project.manager && project.manager.toString() === reqUser.id) ||
    (project.members && project.members.some((memberId) => memberId.toString() === reqUser.id))
  );
};

const getComments = async (req, res, next) => {
  try {
    const { taskId, task, projectId, project } = req.query;
    const filter = {};

    const targetTask = taskId || task;
    const targetProject = projectId || project;

    if (targetTask) filter.task = targetTask;
    if (targetProject) filter.project = targetProject;

    const comments = await Comment.find(filter)
      .populate('user', 'name email role profileImage')
      .populate('task', 'title status')
      .populate('project', 'name')
      .populate('parentComment')
      .sort({ createdAt: 1 });

    return sendResponse(res, 200, true, 'Comments retrieved successfully', comments);
  } catch (error) {
    return next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { task, taskId, project, projectId, content, parentComment } = req.body;

    if (!content || !content.trim()) {
      return sendResponse(res, 400, false, 'Comment content is required');
    }

    const resolvedTaskId = task || taskId;
    let resolvedProjectId = project || projectId;
    let taskDoc = null;

    if (resolvedTaskId) {
      taskDoc = await Task.findById(resolvedTaskId);
      if (taskDoc) {
        resolvedProjectId = resolvedProjectId || taskDoc.project;
      }
    }

    if (!resolvedProjectId) {
      return sendResponse(res, 400, false, 'Comment must belong to a task or project');
    }

    const projectDoc = await Project.findById(resolvedProjectId);
    if (!projectDoc) {
      return sendResponse(res, 404, false, 'Project not found');
    }

    const canAccess = await ensureCommentAccess(resolvedProjectId, req.user);
    if (!canAccess) {
      return sendResponse(res, 403, false, 'You are not authorized to comment in this project');
    }

    const comment = await Comment.create({
      task: resolvedTaskId || null,
      project: resolvedProjectId,
      user: req.user.id,
      content: content.trim(),
      parentComment: parentComment || null,
    });

    await createActivity({
      projectId: resolvedProjectId,
      userId: req.user.id,
      action: 'COMMENT_ADDED',
      entityType: 'COMMENT',
      entityId: comment._id,
      details: {
        content: comment.content.slice(0, 100),
        taskTitle: taskDoc?.title || null,
      },
    });

    // Notify project manager or task assignee if commenter is someone else
    if (taskDoc && taskDoc.assignedTo && taskDoc.assignedTo.toString() !== req.user.id.toString()) {
      await createNotification({
        recipient: taskDoc.assignedTo,
        sender: req.user.id,
        type: 'MENTION',
        title: 'New comment on your task',
        message: `${req.user.name || 'A teammate'} commented on "${taskDoc.title}": "${content.slice(0, 80)}"`,
        relatedProject: resolvedProjectId,
        relatedTask: taskDoc._id,
      });
    } else if (projectDoc.manager && projectDoc.manager.toString() !== req.user.id.toString()) {
      await createNotification({
        recipient: projectDoc.manager,
        sender: req.user.id,
        type: 'PROJECT_UPDATE',
        title: 'New comment in project',
        message: `${req.user.name || 'A teammate'} commented on project "${projectDoc.name}"`,
        relatedProject: resolvedProjectId,
      });
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email role profileImage')
      .populate('project', 'name')
      .populate('task', 'title');

    return sendResponse(res, 201, true, 'Comment created successfully', populatedComment);
  } catch (error) {
    return next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return sendResponse(res, 404, false, 'Comment not found');
    }

    if (req.user.role !== 'ADMIN' && comment.user.toString() !== req.user.id) {
      return sendResponse(res, 403, false, 'You are not authorized to update this comment');
    }

    if (req.body.content) {
      comment.content = req.body.content.trim();
    }

    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email role profileImage')
      .populate('project', 'name')
      .populate('task', 'title');

    return sendResponse(res, 200, true, 'Comment updated successfully', populatedComment);
  } catch (error) {
    return next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return sendResponse(res, 404, false, 'Comment not found');
    }

    if (req.user.role !== 'ADMIN' && comment.user.toString() !== req.user.id) {
      return sendResponse(res, 403, false, 'You are not authorized to delete this comment');
    }

    await comment.deleteOne();
    return sendResponse(res, 200, true, 'Comment deleted successfully');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
};
