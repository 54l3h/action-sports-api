import asyncHandler from "express-async-handler";
import User from "../../models/user.model.js";
import * as factory from "../../common/handlerFactory.service.js";
import AppError from "../../utils/AppError.js";

export const getUser = factory.getOne(User);

export const getUsers = factory.getAll(User);

export const createUser = asyncHandler(async (req, res, next) => {
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
