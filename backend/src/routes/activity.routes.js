const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const Activity = require('../models/Activity');
const Project = require('../models/Project');
const { sendResponse } = require('../utils/response');

const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role !== 'ADMIN') {
      const visibleProjects = await Project.find({
        $or: [{ manager: req.user.id }, { members: req.user.id }],
      }).select('_id');

      const projectIds = visibleProjects.map((p) => p._id);
      filter = { project: { $in: projectIds } };
    }

    const activities = await Activity.find(filter)
      .populate('user', 'name email role profileImage')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(30);

    return sendResponse(res, 200, true, 'Activities retrieved successfully', activities);
  } catch (error) {
    return next(error);
  }
});

router.get('/project/:projectId', protect, async (req, res, next) => {
  try {
    const activities = await Activity.find({ project: req.params.projectId })
      .populate('user', 'name email role profileImage')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    return sendResponse(res, 200, true, 'Project activities retrieved successfully', activities);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
