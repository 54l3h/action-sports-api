import asyncHandler from "express-async-handler";
import Product from "../../../models/product.model.js";
import AppError from "../../../utils/AppError.js";
import Category from "../../../models/category.model.js";
import SubCategory from "../../../models/subCategory.model.js";
import Brand from "../../../models/brand.model.js";
import cloud from "../../../config/cloudinary.js";

export const createProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    title,
    description,
    quantity,
    price,
    category,
    brand,
    subCategory,
    installationPrice,
  } = req.body;

  const existingCategory = await Category.findById(category);

  if (!existingCategory) {
    throw new AppError("Category not found", 404);
  }

  if (brand) {
    const existingBrand = await Brand.findById(brand);
    if (!existingBrand) {
      throw new AppError("Brand not found", 404);
    }
  }

  if (subCategory) {
    const existingSubCategory = await SubCategory.findById(subCategory);
    if (!existingSubCategory) {
      throw new AppError("Subcategory not found", 404);
    }

    if (!existingSubCategory.category.equals(existingCategory._id)) {
      throw new AppError(
        "This subcategory does not belong to this category",
        400
      );
    }
  }

  const existingProduct = await Product.findOne({ name, title });

  if (existingProduct) {
    throw new AppError("This product is already exist", 409);
  }

  const files = req.files;

  if (!files.length) {
    throw new AppError("Product images are required", 409);
  }

  let images = [];

  for (const file of files) {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const publicId = `${file.fieldname}-${uniqueSuffix}`;

    let uploadResult;
    try {
      uploadResult = await cloud.uploader.upload(dataUri, {
        folder: `${process.env.CLOUDINARY_FOLDER || "uploads"}/${
          Product.modelName
        }`,
        public_id: publicId,
        resource_type: "image",
        overwrite: false,
      });
    } catch (err) {
      return next(err);
    }

    const { secure_url, public_id } = uploadResult;
    images.push({ secure_url, public_id });
  }

  if (!images.length) {
    throw new AppError("Product images are required", 409);
  }

  const product = await Product.create({
    name,
    title,
    description,
    quantity,
    price,
    images,
    category,
    subCategory,
    brand,
    installationPrice,
    ...req.body,
  });

  return res.status(201).json({
    success: true,
    message: "Product added successfully",
    data: product,
  });
});
