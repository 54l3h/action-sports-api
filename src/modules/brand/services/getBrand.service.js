import asyncHandler from "express-async-handler";
import Brand from "../../../models/brand.model.js";
import { isValidObjectId } from "mongoose";
import AppError from "../../../utils/AppError.js";

/**
 * @desc    Get a single brand by ID
 * @route   GET /api/brands/:id
 * @access  Public
 */
export const getBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await Brand.findById(id);
  if (!brand) {
    throw new AppError("Brand not found", 404);
  }
  return res.status(200).json({
    success: true,
    message: "Brand retrieved successfully",
    data: {
      brand,
    },
  });
});
