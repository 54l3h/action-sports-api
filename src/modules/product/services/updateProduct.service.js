import asyncHandler from "express-async-handler";
import Product from "../../../models/product.model.js";
import AppError from "../../../utils/AppError.js";
import cloud from "../../../config/cloudinary.js";

/**
 * @desc    Update product (appends images, updates fields)
 * @route   PATCH /api/products/:id
 */
export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const allowedFields = [
    "name",
    "title",
    "description",
    "specs",
    "quantity",
    "price",
    "category",
    "subcategory",
    "brand",
    "installationPrice",
    "priceAfterDiscount",
  ];

  const updateQuery = {};

  // --- 1. Text Fields Update ($set) ---
  const setData = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      setData[field] = req.body[field];
    }
  }

  if (Object.keys(setData).length > 0) {
    updateQuery.$set = setData;
  }

  // --- 2. Image Append Logic ($push) ---
  if (req.files && req.files.length > 0) {
    const uploads = await Promise.all(
      req.files.map((file) =>
        cloud.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "uploads/products" }
        )
      )
    );

    // Using $push with $each explicitly appends to the existing array
    updateQuery.$push = {
      images: {
        $each: uploads.map((img) => ({
          secure_url: img.secure_url,
          public_id: img.public_id,
        })),
      },
    };
  }

  if (Object.keys(updateQuery).length === 0) {
    return next(new AppError("Nothing to update", 400));
  }

  // --- 3. Database Execution ---
  const updatedProduct = await Product.findByIdAndUpdate(id, updateQuery, {
    new: true,
    runValidators: true,
    // Removed strict: true to ensure operators like $push work correctly
  });

  if (!updatedProduct) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({ success: true, data: updatedProduct });
});
