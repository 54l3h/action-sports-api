import asyncHandler from "express-async-handler";
import Category from "../../../models/category.model.js";
import slugify from "slugify";
import AppError from "../../../utils/AppError.js";

/**
 * @desc    Create a new category
 * @route   POST /api/category
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends a JSON response with the created category
 */
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    throw new AppError("Category name is required", 400);
  }

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new AppError("Category already exists", 409);
  }

  const category = await Category.create({
    name,
    slug: slugify(name),
  });

  if (!category) {
    throw new AppError("Unable to create category", 500);
  }
  return res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});
