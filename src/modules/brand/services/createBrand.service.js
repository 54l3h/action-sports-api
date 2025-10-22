import asyncHandler from "express-async-handler";
import Brand from "../../../models/brand.model.js";
import slugify from "slugify";
import AppError from "../../../utils/AppError.js";

/**
 * @desc    Create a new brand
 * @route   POST /api/brands
 * @access  Private
 */
export const createBrand = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const existingBrand = await Brand.findOne({ name });
  if (existingBrand) {
    throw new AppError("Brand already exists", 409);
  }

  const brand = await Brand.create({
    name,
    slug: slugify(name),
  });

  if (!brand) {
    throw new AppError("Unable to create brand", 500);
  }
  return res.status(201).json({
    success: true,
    message: "Brand created successfully",
    data: brand,
  });
});
