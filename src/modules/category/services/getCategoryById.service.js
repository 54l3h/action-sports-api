import asyncHandler from "express-async-handler";
import Category from "../../../models/category.model.js";
import { isValidObjectId } from "mongoose";
import AppError from "../../../utils/AppError.js";
import { getOne } from "../../../common/handlerFactory.service.js";

/**
 * @desc    Get a single category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategoryById = getOne(Category)
