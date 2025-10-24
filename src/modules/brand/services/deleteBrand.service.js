import Brand from "../../../models/brand.model.js";
import { deleteOne } from "../../../common/handlerFactory.service.js";

/**
 * @desc    Delete a brand by ID
 * @route   DELETE /api/brands/:id
 * @access  Private
 */
export const deleteBrand = deleteOne(Brand);
