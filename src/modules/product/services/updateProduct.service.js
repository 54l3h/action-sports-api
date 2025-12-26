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
    throw new AppError("Product not found", 404);
  }

  // Generate new slug if name changes
  if (req.body.name) {
    updateData.slug = slugify(req.body.name);
  }

  // Handle image uploads if files are provided
  if (req.files && req.files.length > 0) {
    let newImages = [];

    for (const file of req.files) {
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const publicId = `${file.fieldname}-${uniqueSuffix}`;

      let uploadResult;
      try {
        uploadResult = await cloud.uploader.upload(dataUri, {
          folder: `${process.env.CLOUDINARY_FOLDER || "uploads"}/${
            Product.modelName
          }`,
          public_id: publicId,
          resource_type: "image",
          overwrite: false,
        });
      } catch (err) {
        return next(err);
      }

      const { secure_url, public_id } = uploadResult;
      newImages.push({ secure_url, public_id });
    }

    // New images override the old images
    updateData.images = newImages;
  }

  // Perform update
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
