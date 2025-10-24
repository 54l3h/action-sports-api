import asyncHandler from "express-async-handler";
import Category from "../../../models/category.model.js";
import SubCategory from "../../../models/subCategory.model.js";
import AppError from "../../../utils/AppError.js";

/**
 * @desc    Get a subcategory (supports nested and top-level routes)
 * @route   GET /api/categories/:categoryId/subcategories/:subcategoryId
 * @route   GET /api/subcategories/:subcategoryId
 * @access  Public
 */
export const getSubCategory = asyncHandler(async (req, res, next) => {
  const { categoryId, subcategoryId } = req.params; // use `subcategoryId` consistently

  // If categoryId provided, ensure it's valid (and exists)
  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }

  // Build filter depending on whether categoryId was provided
  const filter = categoryId
    ? { _id: subcategoryId, category: categoryId }
    : { _id: subcategoryId };

  // Fetch and optionally populate category name
  const subCategory = await SubCategory.findOne(filter).populate(
    "category",
    "name"
  );

  if (!subCategory) {
    throw new AppError("Subcategory not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Subcategory retrieved successfully",
    data: subCategory,
  });
});
