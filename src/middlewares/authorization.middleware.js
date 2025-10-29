import asyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";

export const authorizationMiddleware = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new AppError("You must be authenticated to access this route", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError("You are not authorized to perform this action", 403);
    }

    next();
  });
};
