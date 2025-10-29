import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User, { UserRoles } from "../models/user.model.js";
import AppError from "../utils/AppError.js";

export const authorizationMiddleware = (role = UserRoles.USER) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new AppError("Authorization header is missing or invalid", 401);
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      throw new AppError("Token not provided", 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new AppError("Invalid or expired token", 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (role && user.role !== role) {
      throw new AppError("Unauthorized user", 403);
    }

    req.user = user;

    next();
  });
};
