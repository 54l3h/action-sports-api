import { model, Schema } from "mongoose";

const paymentSettingSchema = new Schema(
  {
    payOnDelivery: {
      type: Boolean,
      default: true,
    },
    payWithCard: {
      type: Boolean,
      default: true,
    },
    installments: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const PaymentSetting = model("Setting", paymentSettingSchema);

export default PaymentSetting;
