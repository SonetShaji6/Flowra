const { sendResponse } = require('../utils/response');

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user && req.user.role;

    if (!userRole || !roles.includes(userRole)) {
      return sendResponse(
        res,
        403,
        false,
        'You do not have permission to access this resource'
      );
    }

    next();
  };
};

const authorize = (...roles) => authorizeRoles(...roles);

module.exports = { authorize, authorizeRoles };
