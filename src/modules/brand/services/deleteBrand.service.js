import asyncHandler from "express-async-handler";
import Brand from "../../../models/brand.model.js";
import AppError from "../../../utils/AppError.js";

/**
 * @desc    Delete a brand by ID
 * @route   DELETE /api/brands/:id
 * @access  Private
 */
export const deleteBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await Brand.findByIdAndDelete(id, { new: true });

  if (!brand) {
    throw new AppError("Brand not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Brand deleted successfully",
    data: brand,
  });
});
