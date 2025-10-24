import { updateOne } from "../../../common/handlerFactory.service.js";
import Brand from "../../../models/brand.model.js";

/**
 * @desc    Update brand
 * @route   PATCH /api/brands/:id
 * @access  Private
 */
export const updateBrand = updateOne(Brand)
