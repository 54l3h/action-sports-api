import asyncHandler from "express-async-handler";
import Product from "../../../models/product.model.js";
import AppError from "../../../utils/AppError.js";
import slugify from "slugify";
import Category from "../../../models/category.model.js";
import SubCategory from "../../../models/subCategory.model.js";
import Brand from "../../../models/brand.model.js";
import { Types } from "mongoose";

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

    // if (
    //   !new Types.ObjectId(existingSubCategory.category._id).equals(
    //     existingCategory._id
    //   )
    // )
    //   throw new AppError(
    //     "This subcategory does not belong to this category",
    //     400
    //   );

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

  const product = await Product.create({
    name,
    title,
    slug: slugify(name),
    description,
    quantity,
    price,
    // coverImage,
    category,
    brand,
  });

  return res.status(201).json({
    success: true,
    message: "Product added successfully",
    data: product,
  });
});
