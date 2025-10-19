import asyncHandler from "express-async-handler";
import CategoryModel from "../../../models/category.model.js";

/**
 * @desc    Delete category
 * @route   DELETE /api/category
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends a JSON response with the deleted category
 */
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await CategoryModel.findByIdAndDelete(id, { new: true });

  if (!category) {
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  }

  return res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: category,
  });
});
