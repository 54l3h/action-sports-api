import asyncHandler from "express-async-handler";
import CategoryModel from "../../../models/category.model.js";
import slugify from "slugify";

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

  const category = await CategoryModel.findByIdAndUpdate(
    id,
    { name, slug: slugify(name) },
    { new: true }
  );
  if (!category) {
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  }

  return res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});
