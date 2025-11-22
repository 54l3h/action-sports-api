import { model, Schema } from "mongoose";

const bannerSchema = new Schema(
  {
    image: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    link: { type: String, default: "" },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Banner = model("Banner", bannerSchema);

export default Banner;
