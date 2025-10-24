import Brand from "../../../models/brand.model.js";
import { createOne } from "../../../common/handlerFactory.service.js";

/**
 * @desc    Create a new brand
 * @route   POST /api/brands
 * @access  Private
 */
export const createBrand = createOne(Brand)