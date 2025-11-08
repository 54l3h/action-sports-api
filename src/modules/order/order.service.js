import asyncHandler from "express-async-handler";
import User, { UserRoles } from "../../models/user.model.js";
import Cart from "../../models/cart.model.js";
import Product from "../../models/product.model.js";
import Order from "../../models/order.model.js";
import AppError from "../../utils/AppError.js";
import Stripe from "stripe";

const calculateTotalItemsAndPrice = (cart) => {
  let totalItems = 0;
  let totalPrice = 0;
  cart.items.forEach((item) => {
    totalItems += item.qty;
    totalPrice += item.unitPrice * item.qty;
  });

  cart.totalItems = totalItems;
  cart.totalPrice = totalPrice;

  return cart;
};

/**
 * @description Create cash order
 * @route POST /api/orders/:cartId
 * @access User
 */
export const createCashOrder = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  const { cartId } = req.params;
  // After creating the order => decrement the product quantity, increase product sold

  // Get cart depend on cartId

  const userId = req.user._id;

  // Get cart for logged user
  let cart = await Cart.findById(cartId);
  if (!cart) {
    throw new AppError("Your cart is already empty", 409);
  }

  // Get order price depend on cart price
  const cartPrice = cart.totalPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // Create order with default payment method (cash)
  const order = await Order.create({
    userId,
    cartItems: cart.items,
    totalOrderPrice,
    shippingAddress: req.body.shippingAddress,
  });

  if (!order) {
    throw new AppError(
      "An error occured while trying to create your order, please try again later",
      409
    );
  }

  const bulkOptions = cart.items.map((item) => ({
    updateOne: {
      filter: { _id: item.productId },
      update: { $inc: { quantity: -item.qty, sold: item.qty } },
    },
  }));

  await Product.bulkWrite(bulkOptions, {});

  // Clear cart depend on cartId
  cart.items = [];
  cart.totalPrice = 0;
  cart.totalItems = 0;
  await cart.save();

  return res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: order,
  });
});
/**
 * @description Get all orders (with filtering & pagination)
 * @route GET /api/orders
 * @access Admin
 */
export const getAllOrders = asyncHandler(async (req, res, next) => {
  const filter = {};

  if (req.query.isPaid) filter.isPaid = req.query.isPaid === "true";
  if (req.query.isDelivered)
    filter.isDelivered = req.query.isDelivered === "true";
  if (req.query.isCanceled) filter.isCanceled = req.query.isCanceled === "true";

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const totalOrders = await Order.countDocuments(filter);

  const orders = await Order.find(filter)
    .populate("userId", "name email")
    .populate("cartItems.productId", "title price")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    totalOrders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit),
    count: orders.length,
    data: orders,
  });
});

/**
 * @description Get all order
 * @route POST /api/orders/:id
 * @access Admin/User
 */
export const getSpecificOrder = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const orderId = req.params.id;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Only the owner or an admin can access this order
  if (!order.userId.equals(userId) && req.user.role !== UserRoles.ADMIN) {
    throw new AppError("You are not authorized to view this order", 403);
  }

  return res.status(200).json({
    success: true,
    message: "Order retrieved successfully",
    data: order,
  });
});

/**
 * @description Get logged user orders
 * @route GET /api/orders
 * @access User
 */
export const getLoggedUserOrders = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const orders = await Order.find({ userId });
  if (orders.length === 0) {
    throw new AppError("You didn't create any order yet");
  }

  return res.status(200).json({
    success: true,
    message: "Orders retrieved successfully",
    data: orders,
  });
});

/**
 * @description Update order payment status (mark as paid)
 * @route PATCH /api/orders/:id/pay
 * @access Admin
 */
export const updateOrderPaymentStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find the order by ID
  const order = await Order.findById(id);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Prevent updating if already paid
  if (order.isPaid) {
    throw new AppError("This order has already been marked as paid", 400);
  }

  // Update payment status
  order.isPaid = true;
  order.paidAt = Date.now();

  await order.save();

  return res.status(200).json({
    success: true,
    message: "Order payment status updated successfully",
    data: order,
  });
});
/**
 * @description Update order delivery status (mark as delivered)
 * @route PATCH /api/orders/:id/deliver
 * @access Admin
 */
export const updateOrderDeliveryStatus = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

    // Find the order by ID
    const order = await Order.findById(id);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // Prevent updating if already delivered
    if (order.isDelivered) {
      throw new AppError(
        "This order has already been marked as delivered",
        400
      );
    }

    // Update delivery status
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order delivery status updated successfully",
      data: order,
    });
  }
);

/**
 * @description Cancel order by user
 * @route PATCH /api/orders/:id/cancel
 * @access User
 */
export const cancelOrderByUser = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { id } = req.params;

  // Find order
  const order = await Order.findById(id);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Check ownership
  if (!order.userId.equals(userId)) {
    throw new AppError("You are not authorized to cancel this order", 403);
  }

  // Check if it's already paid or delivered
  if (order.isPaid) {
    throw new AppError("You cannot cancel a paid order", 400);
  }
  if (order.isDelivered) {
    throw new AppError("You cannot cancel a delivered order", 400);
  }

  // Check if already canceled
  if (order.isCanceled) {
    throw new AppError("Order is already canceled", 400);
  }

  // Cancel order
  order.isCanceled = true;
  order.canceledAt = Date.now();

  await order.save();

  return res.status(200).json({
    success: true,
    message: "Order canceled successfully",
    data: order,
  });
});

/**
 * @description Get checkout session from stripe and send it as a response
 * @route POST /api/orders/checkout-session/:cartId
 * @access User
 */
export const getCheckoutSession = asyncHandler(async (req, res, next) => {
  // 1- Get cart via the cartId
  const { cartId } = req.params;
  const cart = await Cart.findById(cartId);

  if (!cart) {
    throw new AppError("Your cart is already empty", 409);
  }

  // 2- Get order price
  const cartPrice = cart.totalPrice; // e.g., 29.99 (in dollars)
  const quantity = cart.totalItems;

  // 3- Create stripe checkout session
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Order for ${req.user.name}`,
          },
          unit_amount: Math.round(cartPrice * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.host}/api/orders`,
    cancel_url: `${req.protocol}://${req.host}/api/cart`,
    customer_email: req.user.email,
    client_reference_id: cartId.toString(),
    metadata: {
      cartId: cartId.toString(),
      userId: req.user._id.toString(),
      shippingAddress: JSON.stringify(req.body.shippingAddress),
    },
  });

  // 4- Send session to response
  return res.status(200).json({
    success: true,
    data: session,
  });
});

export const webhookCheckout = asyncHandler(async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const endpointSecret = process.env.ENDPOINT_SECRET;
  // prefer raw Buffer (when using express.raw), fall back to req.rawBody if you used verify option
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    const rawBody =
      // if express.raw was used for this route, req.body will be a Buffer
      Buffer.isBuffer(req.body)
        ? req.body
        : // if using express.json({ verify: (req, res, buf) => { req.rawBody = buf } })
        req.rawBody
        ? req.rawBody
        : // last resort (not recommended for production): try stringifying (may break signature)
          Buffer.from(JSON.stringify(req.body), "utf8");

    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        endpointSecret
      );
    } else {
      // If you don't use signing in dev, you can parse body (but not recommended for production)
      event = req.body;
    }
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      console.log("Create order");
      // handle creation logic here, using event.data.object
      break;
    default:
      console.log(`Unhandled event type ${event.type}.`);
  }

  // Respond to Stripe quickly
  return res.status(200).send({ received: true });
});
