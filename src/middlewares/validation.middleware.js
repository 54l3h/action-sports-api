import { validationResult } from "express-validator";

/**
 * Express middleware that checks for validation errors after running express-validator checks.
 *
 * If validation errors are found, it sends a 400 (Bad Request) response with an array of errors.
 * Otherwise, it calls `next()` to continue to the next middleware or route handler.
 */
const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export default validationMiddleware;
