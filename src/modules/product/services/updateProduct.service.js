import asyncHandler from "express-async-handler";
import Product from "../../../models/product.model.js";
import slugify from "slugify";
import AppError from "../../../utils/AppError.js";
import cloud from "../../../config/cloudinary.js";

/**
 * @desc    Update product (with optional image upload)
 * @route   PATCH /api/products/:id
 * @access  Private
 */
export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let updateData = { ...req.body };

  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // 1. Handle Multiple Images Upload (Appending)
  if (req.files && req.files.length > 0) {
    let newImages = [];

    for (const file of req.files) {
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const publicId = `${file.fieldname}-${uniqueSuffix}`;

      try {
        const uploadResult = await cloud.uploader.upload(dataUri, {
          folder: `${process.env.CLOUDINARY_FOLDER || "uploads"}/products`,
          public_id: publicId,
          resource_type: "image",
        });

        newImages.push({
          secure_url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        });
      } catch (err) {
        return next(err);
      }
    }

    // Preserve old images and add the new ones
    updateData.images = [...(product.images || []), ...newImages];
  } else {
    delete updateData.images;
  }

  // 2. Perform Update (Slug is handled by your Schema Middleware)
  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: updatedProduct,
  });
});
