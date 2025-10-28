import asyncHandler from "express-async-handler";
import Category from "../../../models/category.model.js";
import SubCategory from "../../../models/subCategory.model.js";
import slugify from "slugify";
import AppError from "../../../utils/AppError.js";
import cloud from "../../../config/cloudinary.js";

/**
 * @desc    Create a new subcategory
 * @route   GET /api/categories/:categoryId/subcategories
 * @access  Private
 */

export const createSubCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { categoryId } = req.params;
  const file = req.file;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (!name) {
    throw new AppError("Subcategory name is required", 400);
  }
  if (!file) return next(new AppError("Image is required", 400));

  const existingSubCategory = await SubCategory.findOne({
    name,
    category: categoryId,
  });
  if (existingSubCategory) {
    throw new AppError("Subcategory already exists under this category", 409);
  }

  // Build data URI
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64"
  )}`;
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const publicId = `${file.fieldname}-${uniqueSuffix}`;

  // Upload to Cloudinary
  let uploadResult;
  try {
    uploadResult = await cloud.uploader.upload(dataUri, {
      folder: `${process.env.CLOUDINARY_FOLDER || "uploads"}/${
        SubCategory.modelName
      }`,
      public_id: publicId,
      resource_type: "image",
      overwrite: false,
    });
  } catch (err) {
    // Cloudinary errors (network, auth, etc.)
    return next(err);
  }

  const { secure_url, public_id } = uploadResult;

  // Check duplicate name in DB — if duplicate, remove cloud image to avoid orphan
  const existing = await SubCategory.findOne({ name });
  if (existing) {
    try {
      await cloud.uploader.destroy(public_id);
    } catch (delErr) {
      console.warn("Failed to delete duplicate upload:", delErr);
    }
    return next(new AppError("Subcategory already exists", 409));
  }

  const subCategory = await SubCategory.create({
    name,
    slug: slugify(name, { lower: true }),
    category: categoryId,
    image: { secure_url, public_id },
  });

  if (!subCategory) {
    throw new AppError("Unable to create subcategory", 500);
  }
  return res.status(201).json({
    success: true,
    message: "Subcategory created successfully",
    data: subCategory,
  });
});
