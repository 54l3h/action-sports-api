import { model, Schema, Types } from "mongoose";
import Cart from "./cart.model.js";

export const ORDER_DELIVERY_STATUS = {
  NEW: "new",
  PREPARING: "preparing",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
};

const orderSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionRef: String,
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
    subTotalPrice: {
      type: Number,
    },
    shippingAddress: {
      details: String,
      phone: String,
      city: {
        type: Types.ObjectId,
        ref: "ShippingZone",
      },
      postalCode: String,
    },
    cartDescription: String,
    cartId: {
      type: Types.ObjectId,
      ref: "Cart",
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
    deliveryStatus: {
      type: String,
      enum: Object.values(ORDER_DELIVERY_STATUS),
      default: ORDER_DELIVERY_STATUS.NEW,
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
  this.populate([
    {
      path: "userId",
      select: "name email phone",
    },
    {
      path: "cartItems.productId",
      select: "name",
    },
    {
      path: "shippingAddress.city",
      select: "nameAr nameEn",
    },
  ]);
  next();
});

const Order = model("Order", orderSchema);

export default Order;
