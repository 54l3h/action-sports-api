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

  // 1. Define allowed text fields
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

  // 2. Build the $set object (for text fields)
  const setData = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      setData[field] = req.body[field];
    }
  }

  // 3. Prepare the main update object
  const updateQuery = {};

  if (Object.keys(setData).length > 0) {
    updateQuery.$set = setData;
  }

  // 4. Handle Images - Append using $push + $each
  if (req.files && req.files.length > 0) {
    const uploads = await Promise.all(
      req.files.map((file) =>
        cloud.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "uploads/products" }
        )
      )
    );

    // CRITICAL: We use $push with $each to force an append
    updateQuery.$push = {
      images: {
        $each: uploads.map((img) => ({
          secure_url: img.secure_url,
          public_id: img.public_id,
        })),
      },
    };
  }

  // 5. Validation Check
  if (Object.keys(updateQuery).length === 0) {
    return next(new AppError("Nothing to update", 400));
  }

  // 6. Execute Update
  // We remove 'strict: true' to ensure MongoDB operators are not blocked
  const updatedProduct = await Product.findByIdAndUpdate(id, updateQuery, {
    new: true,
    runValidators: true,
  });

  if (!updatedProduct) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({ success: true, data: updatedProduct });
});
