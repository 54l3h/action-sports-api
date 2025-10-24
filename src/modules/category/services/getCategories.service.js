import asyncHandler from "express-async-handler";
import Category from "../../../models/category.model.js";
import AppError from "../../../utils/AppError.js";
import { getAll } from "../../../common/handlerFactory.service.js";

/**
 * @desc    Get all categories with pagination
 * @route   GET /api/category
 * @access  Public
 */
export const getCategories = getAll(Category)