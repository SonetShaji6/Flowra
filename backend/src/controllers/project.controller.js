const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const { sendResponse } = require('../utils/response');
const { createActivity, createNotification } = require('../utils/activity');

const ensureProjectAccess = async (projectId, reqUser) => {
  const project = await Project.findById(projectId)
    .populate('manager', 'name email role profileImage isActive')
    .populate('members', 'name email role profileImage isActive');

  if (!project) {
    return { project: null, allowed: false, isManagerOrAdmin: false };
  }

  if (reqUser.role === 'ADMIN') {
    return { project, allowed: true, isManagerOrAdmin: true };
  }

  const isManager = project.manager && (project.manager._id || project.manager).toString() === reqUser.id;
  const isMember = project.members && project.members.some(
    (member) => (member._id || member).toString() === reqUser.id
  );

  return {
    project,
    allowed: isManager || isMember,
    isManagerOrAdmin: isManager,
  };
};

const getProjects = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (req.user.role !== 'ADMIN') {
      filter.$or = [
        ...(filter.$or || []),
        { manager: req.user.id },
        { members: req.user.id },
      ];
    }

    const projects = await Project.find(filter)
      .populate('manager', 'name email role profileImage')
      .populate('members', 'name email role profileImage')
      .sort({ updatedAt: -1, createdAt: -1 });

    return sendResponse(res, 200, true, 'Projects retrieved successfully', projects);
  } catch (error) {
    return next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const { project, allowed } = await ensureProjectAccess(req.params.id, req.user);

    if (!project) {
      return sendResponse(res, 404, false, 'Project not found');
    }

    if (!allowed) {
      return sendResponse(res, 403, false, 'You are not authorized to view this project');
    }

    return sendResponse(res, 200, true, 'Project retrieved successfully', project);
  } catch (error) {
    return next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate, deadline, status, priority, members = [] } = req.body;

    const managerId = req.user.role === 'ADMIN' && req.body.manager ? req.body.manager : req.user.id;

    const membersSet = new Set(members.map((id) => id.toString()));
    membersSet.add(managerId.toString());

    const project = await Project.create({
      name,
      description,
      manager: managerId,
      members: Array.from(membersSet),
      startDate: startDate || new Date(),
      deadline: deadline || undefined,
      status: status || 'PLANNING',
      priority: priority || 'MEDIUM',
      progress: 0,
    });

    await createActivity({
      projectId: project._id,
      userId: req.user.id,
      action: 'PROJECT_CREATED',
      entityType: 'PROJECT',
      entityId: project._id,
      details: { name: project.name, status: project.status },
    });

    const populatedProject = await Project.findById(project._id)
      .populate('manager', 'name email role profileImage')
      .populate('members', 'name email role profileImage');

    return sendResponse(res, 201, true, 'Project created successfully', populatedProject);
  } catch (error) {
    return next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { project, isManagerOrAdmin } = await ensureProjectAccess(req.params.id, req.user);

    if (!project) {
      return sendResponse(res, 404, false, 'Project not found');
    }

    if (!isManagerOrAdmin) {
      return sendResponse(res, 403, false, 'Only project managers or admins can modify project details');
    }

    const allowedFields = ['name', 'description', 'startDate', 'deadline', 'status', 'priority'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    if (req.user.role === 'ADMIN' && req.body.manager) {
      project.manager = req.body.manager;
      if (!project.members.some((m) => (m._id || m).toString() === req.body.manager)) {
        project.members.push(req.body.manager);
      }
    }

    await project.save();

    await createActivity({
      projectId: project._id,
      userId: req.user.id,
      action: 'PROJECT_UPDATED',
      entityType: 'PROJECT',
      entityId: project._id,
      details: { name: project.name, status: project.status },
    });

    const populatedProject = await Project.findById(project._id)
      .populate('manager', 'name email role profileImage')
      .populate('members', 'name email role profileImage');

    return sendResponse(res, 200, true, 'Project updated successfully', populatedProject);
  } catch (error) {
    return next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { project, isManagerOrAdmin } = await ensureProjectAccess(req.params.id, req.user);

    if (!project) {
      return sendResponse(res, 404, false, 'Project not found');
    }

    if (!isManagerOrAdmin) {
      return sendResponse(res, 403, false, 'Only project managers or admins can delete this project');
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    return sendResponse(res, 200, true, 'Project deleted successfully');
  } catch (error) {
    return next(error);
  }
};

const getProjectMembers = async (req, res, next) => {
  try {
    const { project, allowed } = await ensureProjectAccess(req.params.projectId || req.params.id, req.user);

    if (!project) {
      return sendResponse(res, 404, false, 'Project not found');
    }

    if (!allowed) {
      return sendResponse(res, 403, false, 'You are not authorized to view team members for this project');
    }

    return sendResponse(res, 200, true, 'Project members retrieved successfully', {
      manager: project.manager,
      members: project.members,
    });
  } catch (error) {
    return next(error);
  }
};

const addProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return sendResponse(res, 400, false, 'User ID is required');
    }

    const { project, isManagerOrAdmin } = await ensureProjectAccess(projectId, req.user);

    if (!project) {
      return sendResponse(res, 404, false, 'Project not found');
    }

    if (!isManagerOrAdmin) {
      return sendResponse(res, 403, false, 'Only project managers or admins can add members');
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return sendResponse(res, 404, false, 'User not found');
    }

    if (!targetUser.isActive) {
      return sendResponse(res, 400, false, 'Cannot add an inactive user to a project');
    }

    const isAlreadyMember = project.members.some(
      (member) => (member._id || member).toString() === userId.toString()
    );

    if (isAlreadyMember) {
      return sendResponse(res, 400, false, 'User is already a member of this project');
    }

    project.members.push(userId);
    await project.save();

    await createActivity({
      projectId: project._id,
      userId: req.user.id,
      action: 'MEMBER_ADDED',
      entityType: 'MEMBER',
      entityId: targetUser._id,
      details: { memberName: targetUser.name, memberEmail: targetUser.email },
    });

    await createNotification({
      recipient: targetUser._id,
      sender: req.user.id,
      type: 'PROJECT_UPDATE',
      title: 'Added to project',
      message: `You have been added to the project "${project.name}" by ${req.user.name || 'Project Manager'}`,
      relatedProject: project._id,
    });

    const updatedProject = await Project.findById(project._id)
      .populate('manager', 'name email role profileImage')
      .populate('members', 'name email role profileImage');

    return sendResponse(res, 200, true, 'Member added to project successfully', updatedProject);
  } catch (error) {
    return next(error);
  }
};

const removeProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const { userId } = req.params;

    const { project, isManagerOrAdmin } = await ensureProjectAccess(projectId, req.user);

    if (!project) {
      return sendResponse(res, 404, false, 'Project not found');
    }

    if (!isManagerOrAdmin) {
      return sendResponse(res, 403, false, 'Only project managers or admins can remove members');
    }

    const managerId = (project.manager._id || project.manager).toString();
    if (managerId === userId.toString()) {
      return sendResponse(res, 400, false, 'Cannot remove the Project Manager from the project');
    }

    const isMember = project.members.some(
      (member) => (member._id || member).toString() === userId.toString()
    );

    if (!isMember) {
      return sendResponse(res, 404, false, 'User is not a member of this project');
    }

    project.members = project.members.filter(
      (member) => (member._id || member).toString() !== userId.toString()
    );
    await project.save();

    await createActivity({
      projectId: project._id,
      userId: req.user.id,
      action: 'MEMBER_REMOVED',
      entityType: 'MEMBER',
      entityId: userId,
      details: { memberId: userId },
    });

    return sendResponse(res, 200, true, 'Member removed from project successfully');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  ensureProjectAccess,
};
