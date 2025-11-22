import { model, Schema } from "mongoose";

const bannerSchema = new Schema(
  {
    image: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Banner = model("Banner", bannerSchema);

export default Banner;
