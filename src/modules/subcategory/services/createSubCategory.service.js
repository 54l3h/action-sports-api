import asyncHandler from "express-async-handler";
import Category from "../../../models/category.model.js";
import SubCategory from "../../../models/subCategory.model.js";
import slugify from "slugify";
import AppError from "../../../utils/AppError.js";

/**
 * @desc    Create a new subcategory
 * @route   GET /api/categories/:categoryId/subcategories
 * @access  Private
 */

export const createSubCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (!name) {
    throw new AppError("Subcategory name is required", 400);
  }

  const existingSubCategory = await SubCategory.findOne({
    name,
    category: categoryId,
  });
  if (existingSubCategory) {
    throw new AppError("Subcategory already exists under this category", 409);
  }

  const subCategory = await SubCategory.create({
    name,
    slug: slugify(name),
    category: categoryId,
  });

  if (!subCategory) {
    throw new AppError("Unable to create subcategory", 500);
  }
  return res.status(201).json({
    success: true,
    message: "Subcategory created successfully",
    data: subCategory,
  });
});
