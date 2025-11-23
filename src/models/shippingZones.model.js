import { model, Schema } from "mongoose";

const shippingZonesSchema = new Schema(
  {
    nameEn: { type: String, required: true, trim: true },
    nameAr: { type: String, required: true, trim: true },
    key: { type: String, required: true, unique: true },
    shippingRate: { type: Number, required: true },
    isInstallationAvailable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ShippingZones = model("ShippingZone", shippingZonesSchema);

export default ShippingZones;
