import asyncHandler from "express-async-handler";
import Category from "../../../models/category.model.js";
import SubCategory from "../../../models/subCategory.model.js";
import slugify from "slugify";
import AppError from "../../../utils/AppError.js";
import cloud from "../../../config/cloudinary.js";

/**
 * @desc    Update a subcategory (supports nested and top-level routes)
 * @route   PATCH /api/categories/:categoryId/subcategories/:subcategoryId
 * @route   PATCH /api/subcategories/:subcategoryId
 * @access  Private
 */
export const updateSubCategory = asyncHandler(async (req, res, next) => {
  const { categoryId, subcategoryId } = req.params;
  const { name, description } = req.body;
  const file = req.file; // Get the uploaded file
  const updatedData = {};

  if (name) {
    if (!name || String(name).trim().length === 0) {
      throw new AppError("Subcategory name must not be empty", 400);
    }
    updatedData.name = name;
    updatedData.slug = slugify(name, { lower: true, strict: true });
  }
  if (description) updatedData.description = description;

  // --- Start: Image Upload Logic from updateOne ---
  let public_id_to_delete; // To track the ID if we need to roll back

  if (file) {
    // Build data URI
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Use 'image' as fieldname if SubCategory model image field is called 'image'
    const publicId = `image-${uniqueSuffix}`;
    public_id_to_delete = publicId; // Store for potential rollback later

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
    if (secure_url && public_id) updatedData.image = { secure_url, public_id };
  }
  // --- End: Image Upload Logic from updateOne ---

  // Check duplicate name in DB
  if (updatedData.name) {
    // Crucial: Exclude the current document from the duplicate check
    const existing = await SubCategory.findOne({
      name: updatedData.name,
      _id: { $ne: subcategoryId },
    });

    if (existing) {
      // If duplicate name found AND an image was just uploaded, remove the image (Rollback)
      if (public_id_to_delete) {
        try {
          await cloud.uploader.destroy(public_id_to_delete);
        } catch (delErr) {
          console.warn("Failed to delete duplicate upload:", delErr);
        }
      }
      return next(new AppError(`${SubCategory.modelName} already exists`, 409));
    }
  }

  // If categoryId is provided, optionally ensure the category exists
  if (categoryId) {
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      throw new AppError("Category not found", 404);
    }
  }

  // Find and update the subcategory
  const subcategory = await SubCategory.findByIdAndUpdate(
    subcategoryId,
    updatedData,
    { new: true, runValidators: true }
  );

  if (!subcategory) {
    throw new AppError("Subcategory not found", 404);
  }

  // If categoryId provided, ensure the subcategory belongs to that category
  if (categoryId && String(subcategory.category) !== String(categoryId)) {
    throw new AppError(
      "Subcategory does not belong to the specified category",
      400
    );
  }

  return res.status(200).json({
    success: true,
    message: "Subcategory updated successfully",
    data: subcategory,
  });
});
