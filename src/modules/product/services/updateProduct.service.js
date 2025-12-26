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

  const updateQuery = {};

  /* ================================
     1️⃣ Update normal fields
  ================================= */
  if (Object.keys(req.body).length > 0) {
    updateQuery.$set = { ...req.body };
  }

  /* ================================
     2️⃣ Append new images (if any)
  ================================= */
  if (req.files?.length) {
    const uploads = await Promise.all(
      req.files.map((file) => {
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
          "base64"
        )}`;

        return cloud.uploader.upload(dataUri, {
          folder: `${process.env.CLOUDINARY_FOLDER || "uploads"}/products`,
        });
      })
    );

    const newImages = uploads.map((img) => ({
      secure_url: img.secure_url,
      public_id: img.public_id,
    }));

    updateQuery.$push = { images: { $each: newImages } };
  }

  /* ================================
     3️⃣ Prevent empty updates
  ================================= */
  if (!Object.keys(updateQuery).length) {
    return next(new AppError("No data provided to update", 400));
  }

  /* ================================
     4️⃣ Single DB call
  ================================= */
  const updatedProduct = await Product.findByIdAndUpdate(id, updateQuery, {
    new: true,
    runValidators: true,
  });

  if (!updatedProduct) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    data: updatedProduct,
  });
});
