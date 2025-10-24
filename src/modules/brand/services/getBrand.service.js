import asyncHandler from "express-async-handler";
import Brand from "../../../models/brand.model.js";
import { isValidObjectId } from "mongoose";
import AppError from "../../../utils/AppError.js";
import { getOne } from "../../../common/handlerFactory.service.js";

/**
 * @desc    Get a single brand by ID
 * @route   GET /api/brands/:id
 * @access  Public
 */
export const getBrand = getOne(Brand);
