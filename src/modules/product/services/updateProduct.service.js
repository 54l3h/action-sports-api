import asyncHandler from "express-async-handler";
import Product from "../../../models/product.model.js";
import AppError from "../../../utils/AppError.js";
import cloud from "../../../config/cloudinary.js";

/**
 * @desc    Update product (Appends images to existing array)
 * @route   PATCH /api/products/:id
 */
export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const allowedFields = [
    "name",
    "title",
    "description",
    "quantity",
    "price",
    "category",
    "subcategory",
    "brand",
    "installationPrice",
    "priceAfterDiscount",
    "specs",
  ];

  const updateBody = {};
  const pushBody = {};

  // 1. Text Fields ($set)
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateBody[field] = req.body[field];
    }
  }

  // 2. Append Images ($push)
  if (req.files?.length) {
    const uploads = await Promise.all(
      req.files.map((file) =>
        cloud.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "uploads/products" }
        )
      )
    );

    // Explicitly use $push with $each
    pushBody.images = {
      $each: uploads.map((img) => ({
        secure_url: img.secure_url,
        public_id: img.public_id,
      })),
    };
  }

  // 3. Construct Final Atomic Query
  const finalUpdate = {};
  if (Object.keys(updateBody).length > 0) finalUpdate.$set = updateBody;
  if (Object.keys(pushBody).length > 0) finalUpdate.$push = pushBody;

  if (Object.keys(finalUpdate).length === 0) {
    return next(new AppError("Nothing to update", 400));
  }

  // 4. Execute Update (Strict: false helps avoid Mongoose filtering out $push)
  const updatedProduct = await Product.findByIdAndUpdate(id, finalUpdate, {
    new: true,
    runValidators: true,
  });

  if (!updatedProduct) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({ success: true, data: updatedProduct });
});
