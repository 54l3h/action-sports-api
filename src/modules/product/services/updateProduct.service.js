import asyncHandler from "express-async-handler";
import Product from "../../../models/product.model.js";
import slugify from "slugify";
import AppError from "../../../utils/AppError.js";

/**
 * @desc    Update product
 * @route   PATCH /api/products/:id
 * @access  Private
 */
export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (req.body.name) {
    updateData.slug = slugify(req.body.name);
  }

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});
