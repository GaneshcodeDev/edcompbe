const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

/**
 * Validation Middleware
 * Runs after express-validator checks, returns errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => `${e.path}: ${e.msg}`).join(', ');
    return next(ApiError.validation(messages));
  }
  next();
};

module.exports = { validate };
