import asyncHandler from "express-async-handler";
import Product from "../../../models/product.model.js";
import AppError from "../../../utils/AppError.js";
import { isValidObjectId } from "mongoose";

/**
 * @desc    Get a product
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new AppError("Invalid product ID format", 400);
  }

  const product = await Product.findById(id)
    .populate([
      { path: "category", select: "name" },
      // { path: "subCategory", select: "name" },
      { path: "brand", select: "name" },
    ])
    .lean();

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Product retrieved successfully",
    data: product,
  });
});
