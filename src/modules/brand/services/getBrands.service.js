import asyncHandler from "express-async-handler";
import Brand from "../../../models/brand.model.js";
import AppError from "../../../utils/AppError.js";
import { getAll } from "../../../common/handlerFactory.service.js";

/**
 * @desc    Get all brands with pagination
 * @route   GET /api/brands
 * @access  Public
 */
export const getBrands = getAll(Brand);
