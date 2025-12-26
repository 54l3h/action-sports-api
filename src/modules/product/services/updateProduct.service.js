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
  ];

  const updateQuery = {};

  /* ================================
     1️⃣ Build $set safely
  ================================= */
  const setData = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      setData[field] = req.body[field];
    }
  }

  if (Object.keys(setData).length) {
    updateQuery.$set = setData;
  }

  /* ================================
     2️⃣ Append images ONLY from files
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

    updateQuery.$push = {
      images: {
        $each: uploads.map((img) => ({
          secure_url: img.secure_url,
          public_id: img.public_id,
        })),
      },
    };
  }

  /* ================================
     3️⃣ Prevent empty update
  ================================= */
  if (!Object.keys(updateQuery).length) {
    return next(new AppError("No data provided to update", 400));
  }
  console.log("UPDATE QUERY:", JSON.stringify(updateQuery, null, 2));

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
