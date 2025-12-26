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
  const { images, ...restOfBody } = req.body;

  const product = await Product.findById(id);
  if (!product) return next(new AppError("Product not found", 404));

  // Initialize the update object
  let updateQuery = {};

  // 1. Add standard fields to $set
  if (Object.keys(restOfBody).length > 0) {
    updateQuery.$set = { ...restOfBody };
  }

  // 2. Add images to $push
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
    updateQuery.$push = { images: { $each: newImages } };
  }

  // 3. Execute update via the Model
  const updatedProduct = await Product.findByIdAndUpdate(id, updateQuery, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({ success: true, data: updatedProduct });
});
