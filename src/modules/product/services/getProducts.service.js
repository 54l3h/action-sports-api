import asyncHandler from "express-async-handler";
import Product from "../../../models/product.model.js";
import AppError from "../../../utils/AppError.js";

export const getProducts = asyncHandler(async (req, res, next) => {

  // Pagination
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const {
    categoryId,
    subcategoryId,
    brandId,
    minPrice,
    maxPrice,
    minRating,
    maxRating,
    averageRating,
    sortBy,
    keyword,
  } = req.query;

  const filter = {};

  // Get Category, Subcategory or Brand product 
  if (categoryId) filter.category = categoryId;
  if (subcategoryId) filter.subCategory = subcategoryId;
  if (brandId) filter.brand = brandId;

  // Price Range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Rating filter
  if (averageRating) {
    // Show products with averageRating >= provided value
    const rating = Number(averageRating);
    if (rating < 1.0 || rating > 5.0)
      return next(new AppError("Rating must be between 1.0 and 5.0", 400));
    filter.averageRating = { $gte: rating };
  } else if (minRating || maxRating) {
    filter.averageRating = {};
    if (minRating) filter.averageRating.$gte = Math.max(1.0, Number(minRating));
    if (maxRating) filter.averageRating.$lte = Math.min(5.0, Number(maxRating));
  }

  // Sorting logic
  let sortOption = {};
  if (sortBy === "highestRating") sortOption = { averageRating: -1 };
  else if (sortBy === "lowestRating") sortOption = { averageRating: 1 };
  else if (sortBy === "highestPrice") sortOption = { price: -1 };
  else if (sortBy === "lowestPrice") sortOption = { price: 1 };
  else if (sortBy === "mostSold") sortOption = { sold: -1 };
  else sortOption = { createdAt: -1 }; // default: newest first

  let fields;

  // Fielding
  if (req.query.fields) {
    fields = req.query.fields.split(",").join(" ");
  }

  // Searching
  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ];
  }

  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .sort(sortOption)

    .skip(skip)
    .limit(limit)
    .populate([
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" },
      { path: "brand", select: "name" },
    ])
    .select(fields)
    .lean();

  return res.status(200).json({
    success: true,
    message:
      products.length === 0
        ? "No products found"
        : "Products retrieved successfully",
    data: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      results: products.length,
      products,
    },
  });
});
