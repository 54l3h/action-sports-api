import asyncHandler from "express-async-handler";
import AppError from "../../../utils/AppError.js";
import SubCategory from "../../../models/subCategory.model.js";

/**
 * @desc    Get subcategories (all or by category)
 * @route   GET /api/subcategories
 * @route   GET /api/categories/:categoryId/subcategories
 * @access  Public
 */
export const getSubCategories = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const { categoryId } = req.params;

  const filter = categoryId ? { category: categoryId } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const total = await SubCategory.countDocuments(filter);
  const subcategories = await SubCategory.find(filter)
    .populate("category", "name")
    .skip(skip)
    .limit(Number(limit));

  if (!subcategories.length) {
    throw new AppError("No subcategories found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Subcategories retrieved successfully",
    data: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      results: subcategories.length,
      subcategories,
    },
  });
});
