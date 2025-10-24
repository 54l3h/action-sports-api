import asyncHandler from "express-async-handler";
import Category from "../../../models/category.model.js";
import slugify from "slugify";
import AppError from "../../../utils/AppError.js";
import { updateOne } from "../../../common/handlerFactory.service.js";

/**
 * @desc    Update category
 * @route   PATCH /api/categories/:id
 * @access  Private
 */
export const updateCategory = updateOne(Category);
