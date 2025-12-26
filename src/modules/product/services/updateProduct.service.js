import asyncHandler from "express-async-handler";
import Product from "../../../models/product.model.js";
import AppError from "../../../utils/AppError.js";
import cloud from "../../../config/cloudinary.js";

/**
 * @desc    Update product (appends images, updates fields)
 * @route   PATCH /api/products/:id
 * @access  Private
 */
export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // 1. Strip 'images' from req.body to prevent accidental array overwrites
  const { images, ...restOfBody } = req.body;

  // 2. Check if product exists
  const product = await Product.findById(id);
  if (!product) return next(new AppError("Product not found", 404));

  // 3. Prepare the update object with $set for text fields
  let finalUpdate = {
    $set: { ...restOfBody },
  };

  // 4. Handle Multiple Images Upload
  if (req.files && req.files.length > 0) {
    let newImages = [];

    for (const file of req.files) {
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;

      const uploadResult = await cloud.uploader.upload(dataUri, {
        folder: `${process.env.CLOUDINARY_FOLDER || "uploads"}/products`,
        resource_type: "image",
      });

      newImages.push({
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      });
    }

    // Use $push with $each to append new images to the existing array
    finalUpdate.$push = { images: { $each: newImages } };
  }

  // 5. Perform Update on the Model
  const updatedProduct = await Product.findByIdAndUpdate(id, finalUpdate, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: updatedProduct,
  });
});
