import slugify from "slugify";
import CatgeoryModel from "../../../models/category.model.js";
import asyncHandler from "express-async-handler";

/**
 * @desc    Create a new category
 * @route   POST /api/category/create-category
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends a JSON response with the created category
 */
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    throw new Error("Category name is required");
  }

  const slug = slugify(name, "-");
  const category = await CatgeoryModel.create({ name, slug });
  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});
