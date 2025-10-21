import asyncHandler from "express-async-handler";
import Category from "../../../models/category.model.js";
import { isValidObjectId } from "mongoose";
import AppError from "../../../utils/AppError.js";

/**
 * @desc    Get a single category by ID
 * @route   GET /api/category/:id
 * @access  Public
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends a JSON response with the requested category
 */
export const getCategoryById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid category id", 400);
  }
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  return res.status(200).json({
    success: true,
    message: "Category retrieved successfully",
    data: {
      category,
    },
  });
});
