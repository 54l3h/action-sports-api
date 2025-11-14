import asyncHandler from "express-async-handler";
import PaymentSetting from "../../models/paymentSetting.model.js";
import AppError from "../../utils/AppError.js";

/**
 * GET /api/payment-settings
 * Returns the current payment settings status
 */
export const getStatus = asyncHandler(async (req, res, next) => {
  let settings = await PaymentSetting.findOne();

  if (!settings) {
    settings = await PaymentSetting.create({});
  }

  return res.status(200).json({
    success: true,
    data: settings,
  });
});

/**
 * PATCH /api/payment-settings/toggle/:key
 * Toggles payOnDelivery | payWithCard | installments
 */
export const toggle = asyncHandler(async (req, res, next) => {
  const { key } = req.params;

  const allowedKeys = ["payOnDelivery", "payWithCard", "installments"];

  if (!allowedKeys.includes(key)) {
    throw new AppError("Invalid toggle option", 400);
  }

  let settings = await PaymentSetting.findOne();

  if (!settings) {
    settings = await PaymentSetting.create({});
  }

  // Toggle the field
  settings[key] = !settings[key];

  await settings.save();

  return res.status(200).json({
    success: true,
    message: `${key} updated successfully`,
    data: settings,
  });
});
