import asyncHandler from "express-async-handler";
import User from "../../models/user.model.js";
import AppError from "../../utils/AppError.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateOTP } from "../../utils/generateOTP.js";
import crypto from "node:crypto";
import { emailEvent } from "../../utils/events/email.event.js";

export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password, passwordConfirm } = req.body;

  const isExist = await User.findOne({ email });

  if (isExist) {
    throw new AppError("User already exists", 409);
  }

  if (password !== passwordConfirm) {
    throw new AppError("Passwords do not match", 409);
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    passwordConfirm,
  });

  if (!user) {
    throw new AppError("An error occurred while creating the account", 500);
  }

  const activationCode = generateOTP();

  const hashedActivationCode = crypto
    .createHash("sha256")
    .update(activationCode)
    .digest("hex");

  user.activationCode = hashedActivationCode;
  user.activationCodeExpiresAt = Date.now() + 10 * 60 * 1000;
  await user.save();

  try {
    emailEvent.emit("verifyAccount", {
      email,
      name: user.name,
      otp: activationCode,
    });
  } catch (error) {
    user.activationCode = undefined;
    user.activationCodeExpiresAt = undefined;
    await user.save();

    throw new AppError(
      "An error occurred while sending the OTP, please try again later",
      500
    );
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return res.status(201).json({
    success: true,
    message:
      "Account created successfully, please check your email to verify your account",
    data: { otp: activationCode, token },
  });
});

export const signin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  if (!password) {
    throw new AppError("Password is required", 400);
  }

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.verified) {
    throw new AppError(
      "Please verify your account first. Check your email for the verification code.",
      403
    );
  }

  if (user.deactivatedAt) {
    throw new AppError("Your account has been deactivated", 403);
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return res.status(200).json({
    success: true,
    message: "Signed in successfully",
    data: { token },
  });
});

export const verifyAccount = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  if (!otp) {
    throw new AppError("OTP is required", 400);
  }

  const hashedActivationCode = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  const user = await User.findOne({
    email,
    activationCode: hashedActivationCode,
    activationCodeExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired activation code", 400);
  }

  user.verified = true;
  user.activatedAt = Date.now();
  user.activationCode = undefined;
  user.activationCodeExpiresAt = undefined;
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return res.status(200).json({
    success: true,
    message: "Account activated successfully",
    data: { token },
  });
});

export const resendVerificationCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.verified) {
    throw new AppError("Account is already verified", 400);
  }

  const activationCode = generateOTP();
  const hashedActivationCode = crypto
    .createHash("sha256")
    .update(activationCode)
    .digest("hex");

  user.activationCode = hashedActivationCode;
  user.activationCodeExpiresAt = Date.now() + 10 * 60 * 1000;
  await user.save();

  try {
    emailEvent.emit("verifyAccount", {
      email,
      name: user.name,
      otp: activationCode,
    });
  } catch (error) {
    user.activationCode = undefined;
    user.activationCodeExpiresAt = undefined;
    await user.save();

    throw new AppError(
      "An error occurred while sending the OTP, please try again later",
      500
    );
  }

  return res.status(200).json({
    success: true,
    message: "Verification code sent to your email",
    data: { otp: activationCode },
  });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("There is no user associated with this email", 404);
  }

  const resetCode = generateOTP();

  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetCodeExpiresAt = Date.now() + 10 * 60 * 1000;
  user.passwordResetCodeVerified = false;
  await user.save();

  try {
    emailEvent.emit("forgotPassword", {
      email,
      name: user.name,
      otp: resetCode,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpiresAt = undefined;
    user.passwordResetCodeVerified = undefined;
    await user.save();

    throw new AppError(
      "An error occurred while sending the OTP, please try again later",
      500
    );
  }

  return res.status(200).json({
    success: true,
    message: "OTP sent to your email",
  });
});

export const verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    throw new AppError("OTP is required", 400);
  }

  const hashedResetCode = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetCodeExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired reset code", 400);
  }

  user.passwordResetCodeVerified = true;
  user.passwordResetCodeExpiresAt = Date.now() + 10 * 60 * 1000;
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    data: { token },
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) {
    throw new AppError("Password and password confirmation are required", 400);
  }

  if (!user.passwordResetCodeVerified) {
    throw new AppError("Reset code not verified", 403);
  }

  if (password !== passwordConfirm) {
    throw new AppError("Passwords do not match", 400);
  }

  user.password = password;
  user.passwordChangedAt = Date.now();
  user.passwordResetCodeVerified = undefined;
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpiresAt = undefined;
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return res.status(200).json({
    success: true,
    message: "Password reset successfully",
    data: { token },
  });
});
