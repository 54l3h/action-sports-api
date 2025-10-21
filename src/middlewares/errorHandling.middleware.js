/**
 * Global error handling middleware for Express.
 *
 * This middleware catches all application errors and sends a standardized JSON response
 * containing the error message and status code.
 *
 * @function errorHandlingMiddleware
 * @param {import('../utils/AppError.js').default | Error} error - The error object, either a custom AppError or a native Error.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function in the Express stack.
 * @returns {import('express').Response} JSON response with `success`, `message`, `statusCode`, and optionally `stack`.
 *
 * @example
 * // Register this as the last middleware in your Express app:
 * app.use(errorHandlingMiddleware);
 */
export const errorHandlingMiddleware = (error, req, res, next) => {
  return res.status(error.statusCode || 500).json({
    success: false,
    status: error.status || "error",
    message: error.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "DEVELOPMENT" ? error.stack : undefined,
  });
};

export default errorHandlingMiddleware;
