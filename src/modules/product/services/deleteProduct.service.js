import { deleteOne } from "../../../common/handlerFactory.service.js";
import Product from "../../../models/category.model.js";

/**
 * @desc    Delete a product by ID
 * @route   DELETE /api/products/:id
 * @access  Private
 */
export const deleteProduct = deleteOne(Product);