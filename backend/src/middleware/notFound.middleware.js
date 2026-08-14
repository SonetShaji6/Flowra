const { sendResponse } = require('../utils/response');

const notFound = (req, res) => {
  sendResponse(res, 404, false, `Not Found - ${req.originalUrl}`);
};

module.exports = notFound;
