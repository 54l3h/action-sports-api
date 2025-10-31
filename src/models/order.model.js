import { model, Schema, Types } from "mongoose";
import Cart from "./cart.model.js";

const orderSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartItems: [Cart.schema.path("items").schema], // reuse cart items schema
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
      type: Number,
    },
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    isCanceled: {
      type: Boolean,
      default: false,
    },
    canceledAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "userId",
    select: "name email",
  }).populate({
    path: "cartItems.productId",
    select: "name price images",
  });
  next();
});

const Order = model("Order", orderSchema);

export default Order;
