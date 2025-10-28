import { model, Schema, Types } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "SubCategory name is required"],
      unique: [true, "SubCategory name should be unique"],
      minLength: [2, "SubCategory name is too short"],
      maxLength: [32, "SubCategory name is too long"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: { secure_url: String, public_id: String },
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: [true, "SubCategory must belong to a category"],
    },
  },
  { timestamps: true }
);

const SubCategoryModel = model("Subcategory", subCategorySchema);

export default SubCategoryModel;
