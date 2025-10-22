import asyncHandler from "express-async-handler";
import Category from "../../../models/category.model.js";
import SubCategory from "../../../models/subCategory.model.js";
import AppError from "../../../utils/AppError.js";

/**
 * @desc    Delete a subcategory by ID
 * @route   DELETE /api/categories/:categoryId/subcategories/:subcategoryId
 * @route   DELETE /api/subcategories/:subcategoryId
 * @access  Private
 * @returns {Promise<void>} Sends a JSON response with the deleted subcategory
 */
export const deleteSubCategory = asyncHandler(async (req, res, next) => {
  const { categoryId, subcategoryId } = req.params;

  // Ensure subcategoryId exists
  if (!subcategoryId) {
    throw new AppError("Subcategory id is required", 400);
  }

  // Optionally validate category existence if categoryId is provided
  if (categoryId) {
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      throw new AppError("Category not found", 404);
    }
  }

  // Delete the subcategory
  const subcategory = await SubCategory.findByIdAndDelete(subcategoryId);

  if (!subcategory) {
    throw new AppError("Subcategory not found", 404);
  }

  // If categoryId provided, ensure the deleted subcategory belonged to it
  if (categoryId && String(subcategory.category) !== String(categoryId)) {
    // You can choose to either succeed but warn, re-create, or treat as an error.
    // Here we treat it as a bad request because the client specified a mismatched category.
    throw new AppError(
      "Subcategory does not belong to the specified category",
      400
    );
  }

  return res.status(200).json({
    success: true,
    message: "Subcategory deleted successfully",
    data: subcategory,
  });
});
