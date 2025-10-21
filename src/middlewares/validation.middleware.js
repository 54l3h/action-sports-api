import { validationResult } from "express-validator";

/**
 * Express middleware that checks for validation errors after running express-validator checks.
 *
 * If validation errors are found, it sends a 400 (Bad Request) response with an array of errors.
 * Otherwise, it calls `next()` to continue to the next middleware or route handler.
 *
 * @function validationMiddleware
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function in the stack.
 * @returns {void} Sends a JSON response if there are validation errors, otherwise calls `next()`.
 *
 * @example
 * import { body } from "express-validator";
 * import validationMiddleware from "./middlewares/validation.middleware.js";
 *
 * app.post(
 *   "/register",
 *   [
 *     body("email").isEmail(),
 *     body("password").isLength({ min: 6 })
 *   ],
 *   validationMiddleware,
 *   (req, res) => {
 *     res.json({ success: true, message: "User registered successfully" });
 *   }
 * );
 */
const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export default validationMiddleware;
