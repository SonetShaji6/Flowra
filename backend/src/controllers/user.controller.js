const User = require('../models/User');
const { sendResponse } = require('../utils/response');

const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    return sendResponse(res, 200, true, 'Profile retrieved', user.toSafeObject());
  } catch (error) {
    return next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const { name, profileImage } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (profileImage !== undefined) updates.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    return sendResponse(res, 200, true, 'Profile updated successfully', user.toSafeObject());
  } catch (error) {
    return next(error);
  }
};

const updateMyPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    if (!(await user.matchPassword(currentPassword))) {
      return sendResponse(res, 401, false, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return sendResponse(res, 200, true, 'Password updated successfully');
  } catch (error) {
    return next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { role, isActive, search } = req.query;
    const filter = {};

    if (req.user.role !== 'ADMIN') {
      filter.isActive = true;
    } else if (isActive !== undefined) {
      filter.isActive = isActive === 'true' || isActive === true;
    }

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ name: 1 });

    return sendResponse(res, 200, true, 'Users retrieved', users);
  } catch (error) {
    return next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    return sendResponse(res, 200, true, 'User retrieved successfully', user);
  } catch (error) {
    return next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    if (user.role === 'ADMIN' && isActive === false) {
      const activeAdminCount = await User.countDocuments({ role: 'ADMIN', isActive: true });
      if (activeAdminCount <= 1) {
        return sendResponse(res, 400, false, 'Cannot deactivate the final active admin account');
      }
    }

    user.isActive = isActive;
    await user.save();

    return sendResponse(res, 200, true, `User status updated to ${isActive ? 'active' : 'inactive'}`, user.toSafeObject());
  } catch (error) {
    return next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    if (user.role === 'ADMIN' && role !== 'ADMIN') {
      const adminCount = await User.countDocuments({ role: 'ADMIN' });
      if (adminCount <= 1) {
        return sendResponse(res, 400, false, 'Cannot remove the last administrator');
      }
    }

    user.role = role;
    await user.save();

    return sendResponse(res, 200, true, `User role updated to ${role}`, user.toSafeObject());
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  updateMyPassword,
  getUsers,
  getUser,
  updateUserStatus,
  updateUserRole,
};
