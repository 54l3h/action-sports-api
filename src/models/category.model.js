import { model, Schema } from "mongoose";

const categorySchama = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: [true, "Category name should be unique"],
      minLength: [3, "Category name is too short"],
      maxLength: [32, "Category name is too long"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: Sting,
  },
  { timestamps: true }
);

const CatgeoryModel = model("Category", categorySchama);

export default CatgeoryModel;
