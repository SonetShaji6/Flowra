const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');
const { sendResponse } = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return sendResponse(res, 401, false, 'Authentication token is required');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return sendResponse(res, 401, false, 'Invalid authentication token');
    }

    const user = await User.findById(userId);

    if (!user) {
      return sendResponse(res, 401, false, 'User not found');
    }

    if (!user.isActive) {
      return sendResponse(res, 401, false, 'User account is inactive');
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Invalid or expired token');
  }
};

module.exports = { protect };
