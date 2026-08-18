const Notification = require('../models/Notification');
const { sendResponse } = require('../utils/response');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name email role profileImage')
      .populate('relatedProject', 'name')
      .populate('relatedTask', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    return sendResponse(res, 200, true, 'Notifications retrieved successfully', {
      notifications,
      unreadCount,
    });
  } catch (error) {
    return next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!notification) {
      return sendResponse(res, 404, false, 'Notification not found');
    }

    notification.isRead = true;
    await notification.save();

    return sendResponse(res, 200, true, 'Notification marked as read', notification);
  } catch (error) {
    return next(error);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    return sendResponse(res, 200, true, 'All notifications marked as read');
  } catch (error) {
    return next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!notification) {
      return sendResponse(res, 404, false, 'Notification not found');
    }

    return sendResponse(res, 200, true, 'Notification deleted successfully');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
};
