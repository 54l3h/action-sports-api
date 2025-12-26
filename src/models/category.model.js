import { model, Schema } from "mongoose";

const categorySchama = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: [true, "Category name should be unique"],
      minLength: [3, "Category name is too short"],
      maxLength: [256, "Category name is too long"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Category description is required"],
      minLength: [24, "Category description is too short"],
      maxLength: [50, "Category description is too long"],
    },
    image: { secure_url: String, public_id: String },
  },
  { timestamps: true }
);

const CategoryModel = model("Category", categorySchama);

export default CategoryModel;
