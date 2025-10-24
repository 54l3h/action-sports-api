import Category from "../../../models/category.model.js";
import { createOne } from "../../../common/handlerFactory.service.js";

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private
 */
export const createCategory = createOne(Category)
