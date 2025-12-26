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

  if (!public_id) {
    return next(new AppError("Image public_id is required", 400));
  }

  // 1. Attempt to delete from Cloudinary
  const cloudResult = await cloud.uploader.destroy(public_id);

  // Cloudinary returns { result: 'ok' } on success
  // It returns { result: 'not found' } if the ID is wrong
  if (cloudResult.result !== "ok" && cloudResult.result !== "not found") {
    return next(new AppError(`Cloudinary error: ${cloudResult.result}`, 400));
  }

  if (cloudResult.result === "not found") {
    return next(new AppError(`This image is not exist`, 400));
  }

  // 2. Even if not found in Cloudinary, remove it from your DB
  // to keep your database clean
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    {
      $pull: { images: { public_id: public_id } },
    },
    { new: true }
  );

  if (!updatedProduct) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Image removed from database",
    data: updatedProduct,
  });
});
