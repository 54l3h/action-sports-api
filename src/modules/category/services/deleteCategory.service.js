import asyncHandler from "express-async-handler";
import Category from "../../../models/category.model.js";
import AppError from "../../../utils/AppError.js";

/**
 * @desc    Delete a category by ID
 * @route   DELETE /api/category/:id
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends a JSON response with the deleted category
 */
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id, { new: true });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: category,
  });
});
