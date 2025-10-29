import { Schema, model, Types } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      unique: [true, "Product name should be unique"],
      minLength: [3, "Product name is too short"],
      maxLength: [32, "Product name is too long"],
    },
    title: {
      type: String,
      required: [true, "Product title is required"],
      unique: [true, "Product title should be unique"],
      minLength: [8, "Product title is too short"],
      maxLength: [256, "Product title is too long"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minLength: [24, "Product description is too short"],
      maxLength: [2000, "Product description is too long"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      trim: true,
    },
    priceAfterDiscount: {
      type: Number,
      trim: true,
    },
    colors: [String],
    coverImage: {
      type: String,
      // required: [true, "Product cover image is required"],
    },
    images: [
      {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
        _id: false,
      },
    ],
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to a category"],
    },
    subCategory: {
      type: Types.ObjectId,
      ref: "Subcategory",
      required: [true, "Product must belong to a subcategory"],
    },
    brand: {
      type: Types.ObjectId,
      ref: "Brand",
      required: [true, "Product must belong to a brand"],
    },
    averageRating: {
      type: Number,
      min: [1.0, "Rating must be at least 1.0"],
      max: [5.0, "Rating cannot be more than 5.0"],
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: [0, "Rating count cannot be negative"],
    },
  },
  { timestamps: true }
);

const ProductModel = model("Product", productSchema);

export default ProductModel;
