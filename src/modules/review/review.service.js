import * as factory from "../../common/handlerFactory.service.js";
import Review from "../../models/review.model.js";
import asyncHandler from "express-async-handler";
import AppError from "../../utils/AppError.js";
import Product from "../../models/product.model.js";
import { Types } from "mongoose";

export const getReviews = factory.getAll(Review);

export const getReview = factory.getOne(Review);

export const createReview = asyncHandler(async (req, res, next) => {
  const { headline, rating, product } = req.body;
  const reviewer = req.user._id;

  const existingProduct = await Product.findById(product);
  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  const review = await Review.create({
    headline,
    rating: parseInt(rating),
    reviewer,
    product,
  });

  return res.status(201).json({
    success: true,
    message: "Review added successfully",
    data: review,
  });
});

export const updateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { headline, rating } = req.body;
  const reviewerId = req.user._id;

  const review = await Review.findById(id);
  if (!review) throw new AppError("Review not found", 404);

  if (!review.reviewer.equals(reviewerId))
    throw new AppError(
      "You are not authorized to update this review; only the author can do this",
      403
    );

  if (headline) review.headline = headline;
  if (rating) review.rating = parseInt(rating);

  await review.save();

  return res.status(200).json({
    success: true,
    message: "Review updated successfully",
    data: review,
  });
});

export const deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const reviewerId = req.user._id;

  const review = await Review.findById(id);
  if (!review) throw new AppError("Review not found", 404);

  if (!review.reviewer.equals(reviewerId))
    throw new AppError(
      "You are not authorized to delete this review; only the author can do this",
      403
    );

  await review.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});
