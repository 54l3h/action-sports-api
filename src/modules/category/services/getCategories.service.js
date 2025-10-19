import CategoryModel from "../../../models/category.model.js";
import asyncHandler from "express-async-handler";

/**
 * @desc    Get all categories with pagination
 * @route   GET /api/category
 * @access  Public
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends a JSON response with paginated categories
 */
export const getCategories = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const total = await CategoryModel.countDocuments();
  const categories = await CategoryModel.find({})
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    message: "Categories retrieved successfully",
    data: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      results: categories.length,
      categories,
    },
  });
});
