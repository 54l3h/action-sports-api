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

  // 1. Filter out 'images' from req.body to prevent accidental overrides
  const { images, ...restOfBody } = req.body;
  let updateData = { ...restOfBody };

  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // 2. Handle Multiple Images Upload
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

    // Explicitly merge: Existing DB images + New Cloudinary images
    updateData.images = [...(product.images || []), ...newImages];
  }

  // 3. Perform Update
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
