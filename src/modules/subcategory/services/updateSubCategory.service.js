import asyncHandler from "express-async-handler";
import Category from "../../../models/category.model.js";
import SubCategory from "../../../models/subCategory.model.js";
import slugify from "slugify";
import AppError from "../../../utils/AppError.js";

/**
 * @desc    Update a subcategory (supports nested and top-level routes)
 * @route   PATCH /api/categories/:categoryId/subcategories/:subcategoryId
 * @route   PATCH /api/subcategories/:subcategoryId
 * @access  Private
 */
export const updateSubCategory = asyncHandler(async (req, res, next) => {
  const { categoryId, subcategoryId } = req.params;
  const { name } = req.body;

  // If categoryId is provided, optionally ensure the category exists
  if (categoryId) {
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      throw new AppError("Category not found", 404);
    }
  }

  // Build update object only with provided fields
  const update = {};
  if (typeof name !== "undefined") {
    if (!name || String(name).trim().length === 0) {
      throw new AppError("Subcategory name must not be empty", 400);
    }
    update.name = name;
    update.slug = slugify(name, { lower: true, strict: true });
  }

  // Find and update the subcategory
  const subcategory = await SubCategory.findByIdAndUpdate(
    subcategoryId,
    update,
    { new: true, runValidators: true }
  );

  if (!subcategory) {
    throw new AppError("Subcategory not found", 404);
  }

  // If categoryId provided, ensure the subcategory belongs to that category
  if (categoryId && String(subcategory.category) !== String(categoryId)) {
    // Option: you could reassign or reject — here we reject for safety
    throw new AppError(
      "Subcategory does not belong to the specified category",
      400
    );
  }

  return res.status(200).json({
    success: true,
    message: "Subcategory updated successfully",
    data: subcategory,
  });
});
