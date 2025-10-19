import CategoryModel from "../../../models/category.model.js";
import asyncHandler from "express-async-handler";

/**
 * @desc    Get a single category by ID
 * @route   GET /api/category/:id
 * @access  Public
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends a JSON response with the requested category
 */
export const getCategoryById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await CategoryModel.findById(id);

  res.status(200).json({
    success: true,
    message: "Category retrieved successfully",
    data: {
      category,
    },
  });
});
