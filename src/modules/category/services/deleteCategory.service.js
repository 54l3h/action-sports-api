import { deleteOne } from "../../../common/handlerFactory.service.js";
import Category from "../../../models/category.model.js";

/**
 * @desc    Delete a category by ID
 * @route   DELETE /api/categories/:id
 * @access  Private
 */
export const deleteCategory = deleteOne(Category);
