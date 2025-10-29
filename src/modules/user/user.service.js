import asyncHandler from "express-async-handler";
import User from "../../models/user.model.js";
import * as factory from "../../common/handlerFactory.service.js";
import AppError from "../../utils/AppError.js";
import bcrypt from "bcryptjs";

export const getUser = factory.getOne(User);

export const getUsers = factory.getAll(User);

export const createUser = asyncHandler(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    throw new AppError("Passwords not match", 409);
  }

  const user = await User.create(req.body);
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
