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

  const updateQuery = {};

  // -------------------------
  // $set (text fields only)
  // -------------------------
  const setData = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      setData[field] = req.body[field];
    }
  }

  if (Object.keys(setData).length) {
    updateQuery.$set = setData;
  }

  // -------------------------
  // $push (append images)
  // -------------------------
  if (req.files?.length) {
    const uploads = await Promise.all(
      req.files.map((file) =>
        cloud.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "uploads/products" }
        )
      )
    );

    updateQuery.$push = {
      images: {
        $each: uploads.map((img) => ({
          secure_url: img.secure_url,
          public_id: img.public_id,
        })),
      },
    };
  }

  if (!Object.keys(updateQuery).length) {
    return next(new AppError("Nothing to update", 400));
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, updateQuery, {
    new: true,
    runValidators: true,
    strict: true,
  });

  if (!updatedProduct) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({ success: true, data: updatedProduct });
});
