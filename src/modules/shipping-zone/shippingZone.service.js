import asyncHandler from "express-async-handler";
import ShippingZones from "../../models/shippingZones.model.js";
import AppError from "../../utils/AppError.js";

export const getAllShippingZones = asyncHandler(async (req, res) => {
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
  if (!zone) throw new AppError("Shipping zone not found", 404);

  return res.status(200).json({
    success: true,
    message: "Shipping zone retrieved successfully",
    data: zone,
  });
});

export const updateShippingZone = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { nameEn, nameAr, shippingRate, isInstallationAvailable } = req.body;

  const zone = await ShippingZones.findById(id);
  if (!zone) throw new AppError("Shipping zone not found", 404);

  // Update nameEn + key logic
  if (nameEn && nameEn !== zone.nameEn) {
    const newKey = generateKey(nameEn);

    const exists = await ShippingZones.findOne({
      key: newKey,
      _id: { $ne: id },
    });

    if (exists) throw new AppError("This zone already exists", 400);

    zone.nameEn = nameEn;
    zone.key = newKey;
  }

  // Arabic name
  if (nameAr !== undefined) zone.nameAr = nameAr;

  // Shipping rate
  if (shippingRate !== undefined) zone.shippingRate = shippingRate;

  // Boolean (installation availability)
  if (isInstallationAvailable !== undefined) {
    zone.isInstallationAvailable = isInstallationAvailable;
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
  if (!zone) throw new AppError("Shipping zone not found", 404);

  return res.status(200).json({
    success: true,
    message: "Shipping zone deleted successfully",
  });
});

export const addShippingZone = asyncHandler(async (req, res, next) => {
  const { nameAr, nameEn, shippingRate, isInstallationAvailable } = req.body;

  if (!nameEn) throw new AppError("English name is required", 400);

  const key = generateKey(nameEn);

  const exists = await ShippingZones.findOne({ key });
  if (exists) throw new AppError("This zone already exists", 400);

  const zone = await ShippingZones.create({
    nameEn,
    nameAr,
    key,
    shippingRate,
    isInstallationAvailable,
  });

  return res.status(201).json({
    success: true,
    message: "Shipping zone added successfully",
    data: zone,
  });
});

const generateKey = (nameEn) => {
  return nameEn.trim().split(" ")[0].toLowerCase();
};
