import asyncHandler from "express-async-handler";
import Category from "../../../models/category.model.js";
import slugify from "slugify";
import AppError from "../../../utils/AppError.js";

/**
 * @desc    Update category
 * @route   PATCH /api/category/:id
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends a JSON response with the updated category
 */
export const updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await Category.findByIdAndUpdate(
    id,
    { name, slug: slugify(name) },
    { new: true }
  );
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});
