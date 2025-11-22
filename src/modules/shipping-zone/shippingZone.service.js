import asyncHandler from "express-async-handler";
import ShippingZones from "../../models/shippingZones.model.js";
import AppError from "../../utils/AppError.js";

export const getAllShippingZones = asyncHandler(async (req, res, next) => {
  const zones = await ShippingZones.find();

  return res.status(200).json({
    success: true,
    message: "Shipping zones retrieved successfully",
    data: zones,
  });
});

export const getShippingZoneById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const zone = await ShippingZones.findById(id);
  if (!zone) {
    throw new AppError("Shipping zone not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Shipping zone retrieved successfully",
    data: zone,
  });
});

export const updateShippingZone = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { zoneName, shippingRate } = req.body;

  const zone = await ShippingZones.findById(id);
  if (!zone) {
    throw new AppError("Shipping zone not found", 404);
  }

  if (zoneName && zoneName !== zone.zoneName) {
    const isExist = await ShippingZones.findOne({ zoneName });
    if (isExist) {
      throw new AppError("This zone name already exists", 400);
    }
    zone.zoneName = zoneName;
  }

  if (shippingRate !== undefined) {
    zone.shippingRate = shippingRate;
  }

  await zone.save();

  return res.status(200).json({
    success: true,
    message: "Shipping zone updated successfully",
    data: zone,
  });
});

export const deleteShippingZone = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const zone = await ShippingZones.findByIdAndDelete(id);
  if (!zone) {
    throw new AppError("Shipping zone not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Shipping zone deleted successfully",
  });
});

export const addShippingZone = asyncHandler(async (req, res, next) => {
  const { zoneName, shippingRate } = req.body;

  if (!zoneName) {
    throw new AppError("Zone name is required", 400);
  }

  const isExist = await ShippingZones.findOne({ zoneName });
  if (isExist) {
    throw new AppError("This zone already exists", 400);
  }

  const zone = await ShippingZones.create({ zoneName, shippingRate });

  return res.status(201).json({
    success: true,
    message: "Shipping zone added successfully",
    data: zone,
  });
});