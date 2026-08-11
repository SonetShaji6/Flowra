const User = require('../models/User');
const { sendResponse } = require('../utils/response');
const { generateToken } = require('../utils/jwt');
const { NODE_ENV } = require('../config/env');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'TEAM_MEMBER' } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return sendResponse(res, 409, false, 'User with this email already exists');
    }

    if (role === 'ADMIN') {
      return sendResponse(res, 400, false, 'ADMIN role is not allowed for public registration');
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    const safeUser = user.toSafeObject();
    return sendTokenResponse(safeUser, 201, res, 'User registered successfully');
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return sendResponse(res, 401, false, 'Invalid email or password');
    }

    if (!user.isActive) {
      return sendResponse(res, 401, false, 'Your account is inactive');
    }

    const safeUser = user.toSafeObject();
    return sendTokenResponse(safeUser, 200, res, 'Login successful');
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: 'lax',
  });

  return sendResponse(res, 200, true, 'Logout successful');
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    return sendResponse(res, 200, true, 'User retrieved successfully', user.toSafeObject());
  } catch (error) {
    return next(error);
  }
};

const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id || user.id, user.role);

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'lax',
  };

  if (NODE_ENV === 'production') {
    options.secure = true;
  }

  return res.status(statusCode).cookie('token', token, options).json({
    success: true,
    message,
    token,
    data: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
