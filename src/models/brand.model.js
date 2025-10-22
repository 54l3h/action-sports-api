import { model, Schema } from "mongoose";

const brandSchama = new Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      unique: [true, "Brand name should be unique"],
      minLength: [2, "Brand name is too short"],
      maxLength: [32, "Brand name is too long"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

const BrandModel = model("Brand", brandSchama);

export default BrandModel;
