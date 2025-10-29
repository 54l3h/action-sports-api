import asyncHandler from "express-async-handler";
import User from "../../models/user.model.js";
import AppError from "../../utils/AppError.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  const isExist = await User.findOne({ email });

  if (isExist) throw new AppError("User is already exist", 409);

  if (password !== passwordConfirm) {
    throw new AppError("Passwords not match", 409);
  }

  const user = await User.create({ name, email, password, passwordConfirm });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  if (!user) {
    throw new AppError("An error occured while creating the account");
  }

  return res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: token,
  });
});

export const signin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) return next(new AppError("Email is required", 400));
  if (!password) return next(new AppError("Password is required", 400));

  const user = await User.findOne({ email });
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!user || !isPasswordCorrect) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return res.status(200).json({
    success: true,
    message: "Signed in successfully",
    data: token,
  });
});
