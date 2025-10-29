import asyncHandler from "express-async-handler";
import User from "../../models/user.model.js";
import AppError from "../../utils/AppError.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateOTP } from "../../utils/generateOTP.js";
import crypto from "node:crypto";
import { emailEvent } from "../../utils/events/email.event.js";

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
    data: { token },
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
    data: { token },
  });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("There is no user associated with this email", 404);
  }

  const resetCode = generateOTP();
  console.log(resetCode);

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
      "An error occured while sending the otp, please try again later",
      500
    );
  }

  return res.status(200).json({
    success: true,
    message: "OTP sent to the email",
  });
});

export const verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;

  const hashedResetCode = crypto.createHash("sha256").update(otp).digest("hex");
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetCodeExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Reset code invalid", 409);
  }

  user.passwordResetCodeVerified = true;
  user.passwordResetCode = hashedResetCode;
  user.passwordResetCodeExpiresAt = Date.now() + 10 * 60 * 1000;
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return res.status(200).json({
    success: true,
    message: "OTP verified",
    data: { token },
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  // After verify the otp the client-side will get the token and save it in the local storage and send a http request => PATCH /api/auth/reset-password

  const user = req.user;
  const { password, passwordConfirm } = req.body;

  if (!user.passwordResetCodeVerified) {
    throw new AppError("Reset code not verified", 409);
  }

  if (password !== passwordConfirm) {
    throw new AppError("Passwords not match", 409);
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
    message: "Passoword reset successfully",
    data: { token },
  });
});
