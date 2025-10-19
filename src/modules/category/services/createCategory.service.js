import asyncHandler from "express-async-handler";
import CategoryModel from "../../../models/category.model.js";
import slugify from "slugify";

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
    return res.status(400).json({
      success: false,
      message: "Category name is required",
    });
  }

  const existingCategory = await CategoryModel.findOne({ name });
  if (existingCategory) {
    return res.status(409).json({
      success: false,
      message: "Category already exists",
    });
  }

  const category = await CategoryModel.create({
    name,
    slug: slugify(name),
  });
  return res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});
