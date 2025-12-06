import asyncHandler from "express-async-handler";
import User from "../../models/user.model.js";
import AppError from "../../utils/AppError.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateOTP } from "../../utils/generateOTP.js";
import crypto from "node:crypto";
import { emailEvent } from "../../utils/events/email.event.js";

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
  const isProduction = process.env.NODE_ENV === "development";

  // Set access token cookie
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // Prevents JavaScript access
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? "strict" : "lax", // CSRF protection
    maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    path: "/",
  });

  // Set refresh token cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: "/",
  });
};

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

  const { accessToken, refreshToken } = generateTokens(user._id);
  setTokensCookies(res, accessToken, refreshToken);

  return res.status(201).json({
    success: true,
    message:
      "Account created successfully, please check your email to verify your account",
    data: {
      otp: activationCode,
    },
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

  const { accessToken, refreshToken } = generateTokens(user._id);
  setTokensCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    success: true,
    message: "Signed in successfully",
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

  const { accessToken, refreshToken } = generateTokens(user._id);
  setTokensCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    success: true,
    message: "Account activated successfully",
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

  const { accessToken, refreshToken } = generateTokens(user._id);
  setTokensCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    success: true,
    message: "OTP verified successfully",
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

  const { accessToken, refreshToken } = generateTokens(user._id);
  setTokensCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.verified) {
    throw new AppError("Account not verified", 403);
  }

  if (user.deactivatedAt) {
    throw new AppError("Account has been deactivated", 403);
  }

  // Check if password was changed after token was issued
  if (user.passwordChangedAt) {
    const changedTimestamp = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10
    );
    if (decoded.iat < changedTimestamp) {
      throw new AppError("Password was changed. Please login again", 401);
    }
  }

  const tokens = generateTokens(user._id);
  setTokensCookies(res, tokens.accessToken, tokens.refreshToken);

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development",
    sameSite: process.env.NODE_ENV === "development" ? "strict" : "lax",
    path: "/",
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
