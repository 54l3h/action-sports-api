import asyncHandler from "express-async-handler";
import Product from "../../../models/product.model.js";
import AppError from "../../../utils/AppError.js";
import cloud from "../../../config/cloudinary.js";

/**
 * @desc    Update product (with optional image upload)
 * @route   PATCH /api/products/:id
 * @access  Private
 */
export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { images, ...restOfBody } = req.body; // Remove images from body

  // 1. Check if product exists
  const product = await Product.findById(id);
  if (!product) return next(new AppError("Product not found", 404));

  // 2. Prepare the $set object (for name, price, etc.)
  let setUpdate = { ...restOfBody };

  // 3. Prepare the $push object (only if there are new images)
  let pushUpdate = {};

  if (req.files && req.files.length > 0) {
    let newImages = [];
    for (const file of req.files) {
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;
      const uploadResult = await cloud.uploader.upload(dataUri, {
        folder: `${process.env.CLOUDINARY_FOLDER || "uploads"}/products`,
      });

      newImages.push({
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      });
    }
    pushUpdate = { images: { $each: newImages } };
  }

  // 4. Combine them into one update query
  const finalUpdate = {
    $set: setUpdate,
  };

  // Only add $push to the command if there are actually new images
  if (Object.keys(pushUpdate).length > 0) {
    finalUpdate.$push = pushUpdate;
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, finalUpdate, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    data: updatedProduct,
  });
});
