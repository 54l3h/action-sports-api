import { model, Schema, Types } from "mongoose";

const reviewSchema = new Schema(
  {
    headline: {
      type: String,
      required: [true, "Review headline is required"],
      trim: true,
      maxlength: [100, "Headline cannot exceed 100 characters"],
    },
    rating: {
      type: Number,
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
      required: true,
    },
    reviewer: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Reviewer is required"],
    },
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: [true, "Reviewed product is required"],
    },
  },
  { timestamps: true }
);

const ReviewModel = model("Review", reviewSchema);

export default ReviewModel;
