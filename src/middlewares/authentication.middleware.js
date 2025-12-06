import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";

export const authenticationMiddleware = asyncHandler(async (req, res, next) => {
  // Read token from cookies (primary method)
  let token = req.cookies.accessToken;

  // Fallback to Authorization header for API clients that can't use cookies
  if (!token) {
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith("Bearer ")) {
      token = authorization.split(" ")[1];
    }
  }

  if (!token) {
    throw new AppError("Authentication required. Please login.", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("Token expired. Please refresh your token.", 401);
    }
    throw new AppError("Invalid token. Please login again.", 401);
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

  // Check if password was changed after token was issued
  if (user.passwordChangedAt) {
    const changedTimestamp = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10
    );
    if (decoded.iat < changedTimestamp) {
      throw new AppError(
        "Password was changed recently. Please log in again.",
        401
      );
    }
  }

  // Check if account was deactivated after token was issued
  if (user.deactivatedAt) {
    const deactivatedTimestamp = parseInt(
      user.deactivatedAt.getTime() / 1000,
      10
    );
    if (decoded.iat < deactivatedTimestamp) {
      throw new AppError(
        "Account was deactivated. Please contact support.",
        401
      );
    }
  }

  req.user = user;
  next();
});
