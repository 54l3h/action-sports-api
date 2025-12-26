import asyncHandler from "express-async-handler";
import Product from "../../../models/product.model.js";
import AppError from "../../../utils/AppError.js";
import cloud from "../../../config/cloudinary.js";

/**
 * @desc    Delete product image from Cloudinary and Database
 * @route   DELETE /api/products/:id/image
 * @access  Private
 */
export const deleteImage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { public_id } = req.body;
  remove;

  if (!public_id) {
    return next(new AppError("Image public_id is required to delete", 400));
  }

  const cloudResult = await cloud.uploader.destroy(public_id);

  if (cloudResult.result !== "ok") {
    return next(new AppError("Failed to delete image from cloud storage", 400));
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    {
      $pull: {
        images: { public_id: public_id },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedProduct) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Image removed successfully",
    data: updatedProduct,
  });
});
