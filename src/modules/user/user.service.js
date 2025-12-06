import asyncHandler from "express-async-handler";
import User from "../../models/user.model.js";
import * as factory from "../../common/handlerFactory.service.js";
import AppError from "../../utils/AppError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper function to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });

  return { accessToken, refreshToken };
};

// Helper function to set both tokens as cookies
const setTokensCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
};

export const getUser = factory.getOne(User);

export const getUsers = factory.getAll(User);

export const createUser = asyncHandler(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    throw new AppError("Passwords not match", 409);
  }

  const user = await User.create({
    ...req.body,
    activatedAt: Date.now(),
    verified: true,
  });
  return res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return res.status(201).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

export const addAddress = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new AppError("You must be logged in to add an address", 401);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );

  return res.status(201).json({
    success: true,
    message: "Address added successfully",
    data: user.addresses,
  });
});

export const removeAddress = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new AppError("You must be logged in to remove an address", 401);
  }

  const addressId = req.params.id;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: addressId } },
    },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    message: "Address deleted successfully",
    data: user.addresses,
  });
});

export const getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new AppError("You must be logged in to view addresses", 401);
  }

  const user = await User.findById(req.user._id).populate("addresses");

  return res.status(200).json({
    success: true,
    message: "User addresses retrieved successfully",
    data: user.addresses,
  });
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, passwordConfirm } = req.body;
  const { password: hash } = await User.findById(req.params.id);

  const isCorrect = await bcrypt.compare(currentPassword, hash);

  if (!isCorrect) {
    throw new AppError("Current password is incorrect", 409);
  }

  if (newPassword !== passwordConfirm) {
    throw new AppError("Passwords not match", 409);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { password: req.body.newPassword, passwordChangedAt: Date.now() },
    { new: true }
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return res.status(201).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

export const toggleUserActivation = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.active = !user.active;

  await user.save();

  return res.status(201).json({
    success: true,
    message: "User account activation updated successfully",
    data: user,
  });
});

export const deleteUser = factory.deleteOne(User);

export const getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

/**
 * PATCH /api/auth/me/change-password
 * Protected route — authenticationMiddleware must run before this handler.
 */
export const updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, passwordConfirm } = req.body;

  if (!req.user) {
    throw new AppError("You must be logged in to change password", 401);
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isCorrect = await bcrypt.compare(currentPassword, user.password);
  if (!isCorrect) {
    throw new AppError("Current password is incorrect", 401);
  }

  if (newPassword !== passwordConfirm) {
    throw new AppError("New passwords do not match", 400);
  }

  // Set new password and update passwordChangedAt
  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();

  // Generate new tokens and set them in cookies
  const { accessToken, refreshToken } = generateTokens(user._id);
  setTokensCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const updateLoggedUserData = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new AppError("You must be logged in to update your profile", 401);
  }

  const { name, email, phone } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { name, email, phone },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});

export const deactivateLoggedUser = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new AppError("You must be logged in to deactivate your account", 401);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { active: false, deactivatedAt: Date.now() },
    { new: true }
  );

  // Clear authentication cookies on deactivation
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Account deactivated successfully",
  });
});
