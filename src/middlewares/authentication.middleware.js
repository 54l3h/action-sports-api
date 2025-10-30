import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";

export const authenticationMiddleware = asyncHandler(async (req, res, next) => {
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
    throw new AppError(
      "The user associated with this token no longer exists",
      404
    );
  }

  if (user.passwordChangedAt / 1000 >= decoded.iat) {
    throw new AppError(
      "Password was changed recently. Please log in again.",
      401
    );
  }
  
  if (user.deactivatedAt / 1000 >= decoded.iat) {
    throw new AppError(
      "This account is deactivated. Please log in again to activate it.",
      401
    );
  }

  req.user = user;

  next();
});
