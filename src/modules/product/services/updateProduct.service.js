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
  let updateData = { ...restOfBody };

  const product = await ProductModel.findById(id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

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

    updateData.$push = { images: { $each: newImages } };
  }

  const updatedProduct = await ProductModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: updatedProduct,
  });
});
