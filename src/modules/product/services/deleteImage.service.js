import asyncHandler from "express-async-handler";
import Product from "../../../models/product.model.js";
import slugify from "slugify";
import AppError from "../../../utils/AppError.js";
import cloud from "../../../config/cloudinary.js";

/**
 * @desc    Update product (with optional image upload)
 * @route   DELETE /api/products/:id
 * @access  Private
 */
export const deleteImage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  return res.status(200).json({
    success: true,
    message: "Product image deleted successfully",
    data: undefined,
  });
});
