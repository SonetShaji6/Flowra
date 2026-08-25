const { sendResponse } = require('../utils/response');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return sendResponse(res, 400, false, 'Validation failed', null, errors);
  }

  req.body = result.data;
  next();
};

module.exports = { validate };
