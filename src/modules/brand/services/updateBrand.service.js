import asyncHandler from "express-async-handler";
import Brand from "../../../models/brand.model.js";
import slugify from "slugify";
import AppError from "../../../utils/AppError.js";

/**
 * @desc    Update brand
 * @route   PATCH /api/brands/:id
 * @access  Private
 */
export const updateBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const brand = await Brand.findByIdAndUpdate(
    id,
    { name, slug: slugify(name) },
    { new: true }
  );
  if (!brand) {
    throw new AppError("Brand not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Brand updated successfully",
    data: brand,
  });
});
