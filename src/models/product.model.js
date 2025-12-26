import { Schema, model, Types } from "mongoose";
import slugify from "slugify";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      unique: [true, "Product name should be unique"],
      minLength: [3, "Product name is too short"],
      maxLength: [256, "Product name is too long"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Product title is required"],
      unique: [true, "Product title should be unique"],
      minLength: [8, "Product title is too short"],
      maxLength: [256, "Product title is too long"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    specs: {
      type: String,
      required: [true, "specs description is required"],
      minLength: [24, "specs description is too short"],
      maxLength: [2000, "specs description is too long"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minLength: [24, "Product description is too short"],
      maxLength: [700, "Product description is too long"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, "Sold cannot be negative"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    priceAfterDiscount: {
      type: Number,
      min: [0, "Price after discount cannot be negative"],
    },
    colors: [{ type: String, trim: true }],
    coverImage: {
      type: String,
      trim: true,
    },
    installationPrice: {
      type: Number,
      default: 0,
    },
    images: [
      {
        secure_url: { type: String, required: true, trim: true },
        public_id: { type: String, required: true, trim: true },
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

productSchema.pre("save", async function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name);
  }

  next();
});
// Combine findOneAndUpdate and updateOne logic
productSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  const update = this.getUpdate();

  // Handle name/slug if it exists in $set or top level
  let name = null;
  if (update.$set && update.$set.name) {
    name = update.$set.name;
  } else if (update.name) {
    name = update.name;
  }

  if (name) {
    const slug = slugify(name, { lower: true });

    // Ensure we don't overwrite the whole $set object
    if (!update.$set) update.$set = {};
    update.$set.slug = slug;
  }

  next();
});

const ProductModel = model("Product", productSchema);

export default ProductModel;
