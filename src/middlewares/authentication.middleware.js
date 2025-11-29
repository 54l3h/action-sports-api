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

  // Check if account is verified
  if (!user.verified) {
    throw new AppError(
      "Please verify your account first. Check your email for the verification code.",
      403
    );
  }

  if (user.deactivatedAt) {
    throw new AppError("This account is deactivated.", 401);
  }

  if (user.passwordChangedAt && user.passwordChangedAt / 1000 >= decoded.iat) {
    throw new AppError(
      "Password was changed recently. Please log in again.",
      401
    );
  }

  if (user.deactivatedAt && user.deactivatedAt / 1000 >= decoded.iat) {
    throw new AppError(
      "Account was deactivated after token was issued. Please log in again.",
      401
    );
  }

  req.user = user;

  next();
});
