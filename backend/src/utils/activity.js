const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

const createActivity = async ({
  projectId,
  userId,
  action,
  entityType,
  entityId,
  details = {},
}) => {
  if (!projectId || !userId || !action || !entityType || !entityId) {
    return null;
  }

  return Activity.create({
    project: projectId,
    user: userId,
    action,
    entityType,
    entityId,
    details,
  });
};

const createNotification = async ({
  recipient,
  sender,
  type,
  title,
  message,
  relatedProject,
  relatedTask,
}) => {
  if (!recipient || !type || !title || !message) {
    return null;
  }

  return Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    relatedProject,
    relatedTask,
  });
};

module.exports = {
  createActivity,
  createNotification,
};
