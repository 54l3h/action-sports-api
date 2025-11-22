import { model, Schema } from "mongoose";

const shippingZonesSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nameAr: {
      type: String,
      required: true,
      trim: true,
    },
    nameEn: {
      type: String,
      required: true,
      trim: true,
    },
    shippingRate: {
      type: Number,
      default: 350,
    },
  },
  { timestamps: true }
);

const ShippingZones = model("ShippingZone", shippingZonesSchema);

export default ShippingZones;
