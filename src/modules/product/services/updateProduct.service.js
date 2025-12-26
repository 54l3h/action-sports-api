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
  const { images, ...restOfBody } = req.body;

  // 1. Check if product exists
  const product = await Product.findById(id);
  if (!product) return next(new AppError("Product not found", 404));

  // 2. Prepare Update Object
  let updateData = { ...restOfBody };

  // Generate slug if name is updated
  if (updateData.name) {
    updateData.slug = slugify(updateData.name, { lower: true });
  }

  // 3. Handle Multiple Images Upload
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

    // Explicitly use $push to append to existing images
    updateData.$push = { images: { $each: newImages } };
  }

  // 4. Update via the MODEL (Product), not the instance (product)
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
