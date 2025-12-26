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
  const updateQuery = {};

  // 1. Text Fields ($set)
  const setData = {};
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
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) setData[field] = req.body[field];
  }

  if (Object.keys(setData).length > 0) {
    updateQuery.$set = setData;
  }

  // 2. Images ($push) - DO NOT put this in setData
  if (req.files?.length > 0) {
    const uploads = await Promise.all(
      req.files.map((file) =>
        cloud.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "uploads/products" }
        )
      )
    );

    // This MUST be a separate operator from $set to append
    updateQuery.$push = {
      images: {
        $each: uploads.map((img) => ({
          secure_url: img.secure_url,
          public_id: img.public_id,
        })),
      },
    };
  }

  // 3. Update execution (Remove strict: true)
  const updatedProduct = await Product.findByIdAndUpdate(id, updateQuery, {
    new: true,
    runValidators: true,
  });

  if (!updatedProduct) return next(new AppError("Product not found", 404));
  res.status(200).json({ success: true, data: updatedProduct });
});
