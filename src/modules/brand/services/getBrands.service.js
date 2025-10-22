import asyncHandler from "express-async-handler";
import Brand from "../../../models/brand.model.js";
import AppError from "../../../utils/AppError.js";

/**
 * @desc    Get all brands with pagination
 * @route   GET /api/brands
 * @access  Public
 */
export const getBrands = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const total = await Brand.countDocuments();
  const brands = await Brand.find({})
    .skip(skip)
    .limit(Number(limit));

  if (brands.length === 0) {
    throw new AppError("No brands found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Brands retrieved successfully",
    data: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      results: brands.length,
      brands,
    },
  });
});
