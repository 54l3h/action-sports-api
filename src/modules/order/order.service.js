import asyncHandler from "express-async-handler";
import UserModel, { UserRoles } from "../../models/user.model.js";
import Cart from "../../models/cart.model.js";
import Product from "../../models/product.model.js";
import Order, { ORDER_DELIVERY_STATUS } from "../../models/order.model.js";
import ShippingZones from "../../models/shippingZones.model.js";
import AppError from "../../utils/AppError.js";
import Stripe from "stripe";
import axios from "axios";
import { emailEvent } from "../../utils/events/email.event.js";

/**
 * @description Create cash order
 * @route POST /api/orders/:cartId
 * @access User
 */
export const createCashOrder = asyncHandler(async (req, res, next) => {
  // After creating the order => decrement the product quantity, increase product sold

  // Get cart depend on cartId

  const userId = req.user._id;

  const shippingZoneId = req.body.shippingAddress.city;
  console.log({ shippingZoneId });

  const shippingZone = await ShippingZones.findById(shippingZoneId);
  console.log({ shippingZone });

  const shippingPrice = shippingZone.shippingRate;

  const taxPrice = 0;

  // Get cart for logged user

  const cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    throw new AppError("Your cart is already empty", 409);
  }

  if (!cart || cart.length === 0) {
    throw new AppError("Your cart is already empty", 409);
  }

  // Get order price depend on cart price
  const cartPrice = cart.totalPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // Create order with default payment method (cash)
  const createdOrder = await Order.create({
    userId,
    cartItems: cart.items,
    shippingPrice,
    subTotalPrice: cartPrice,
    totalOrderPrice,
    shippingAddress: req.body.shippingAddress,
  });

  if (!createdOrder) {
    throw new AppError(
      "An error occured while trying to create your order, please try again later",
      409
    );
  }

  const order = await Order.findById(createdOrder._id);

  orderEmitter(order);

  await clearCart(cart);

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
 * @route PATCH /api/orders/:id/status/:status
 */
export const updateOrderDeliveryStatus = asyncHandler(
  async (req, res, next) => {
    const { id, status } = req.params;

    // Validate status in lowercase
    if (!Object.values(ORDER_DELIVERY_STATUS).includes(status)) {
      throw new AppError("Invalid delivery status", 400);
    }

    const order = await Order.findById(id);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // Prevent updating after it's delivered
    if (order.isDelivered) {
      throw new AppError("Order has already been delivered", 400);
    }

    // Update status
    order.deliveryStatus = status;

    // Auto-mark delivered
    if (status === ORDER_DELIVERY_STATUS.DELIVERED) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Delivery status updated successfully",
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

const createOrder = async (session) => {
  const { userId, cartId, shippingAddress } = session.metadata;
  const amount_total = session.amount_total;

  const cart = await Cart.findById(cartId);

  if (!cart) {
    throw new AppError(`Cart not found: ${cartId}`, 404);
  }

  if (!cart.items || cart.items.length === 0) {
    throw new AppError(`Cart is empty: ${cartId}`, 404);
  }

  const order = await Order.create({
    userId,
    cartItems: cart.items,
    paymentMethod: "card",
    totalOrderPrice: parseFloat(amount_total / 100),
    isPaid: true,
    paidAt: Date.now(),
    shippingAddress: JSON.parse(shippingAddress),
  });

  if (!order) {
    throw new AppError("Error creating order", 409);
  }

  return { order, cart };
};

const clearCart = async (cart) => {
  const bulkOptions = cart.items.map((item) => ({
    updateOne: {
      filter: { _id: item.productId },
      update: { $inc: { quantity: -item.qty, sold: item.qty } },
    },
  }));

  await Product.bulkWrite(bulkOptions);

  // Clear the cart but keep the same ID
  cart.items = [];
  cart.totalPrice = 0;
  cart.totalItems = 0;

  await cart.save();
};

// export const webhookCheckout = asyncHandler(async (req, res, next) => {
//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
//   const endpointSecret = process.env.ENDPOINT_SECRET;
//   const signature = req.headers["stripe-signature"];

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle the event
//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;

//     // Create order
//     const { order, cart } = await createOrder(session);

//     await clearCart(cart);
//   } else {
//     console.log(`Unhandled event type: ${event.type}`);
//   }

//   return res.status(200).send({ received: true });
// });

/**
 * The user come with their token so you can check their token:
 * You can get the cartId
 * You can get the cart description
 * You can get the customer name
 * You can get the customer email
 * You can get the customer phone
 */
export const payWithPayTabs = asyncHandler(async (req, res, next) => {
  try {
    // Extract the user
    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.productId",
      "name"
    );
    if (!cart || !cart.items.length > 0) {
      throw new AppError("Your cart is already empty", 409);
    }
    // Extract order info from the request body or define them here

    // const cartItems = await cart.populate({ path: "items" });
    const cartItems = cart.items;
    console.log(cartItems);
    const cartDescriptionArray = cartItems.map((item) => {
      return `${item.productId.name} * ${item.qty}`;
    });

    const cartDescription = cartDescriptionArray.join(", ");

    console.log({
      profile_id: process.env.PAYTABS_PROFILE_ID,
      callback: process.env.PAYTABS_CALLBACK_URL,
    });

    // const userData = await UserModel.findById(userId);
    // const shippingZoneId = userData.shippingAddress.city;
    const shippingPrice = await ShippingZones.findById(
      req.user.shippingAddress
    );

    const cart_amount = cart.totalPrice + shippingPrice;

    const payload = {
      profile_id: process.env.PAYTABS_PROFILE_ID, // replace with your profile ID
      tran_type: "sale",
      tran_class: "ecom",
      cart_id: cart._id, // unique order reference
      cart_description: cartDescription,
      cart_currency: "SAR", // change currency if needed
      // cart_amount: cart.totalPrice,
      cart_amount: cart.totalPrice,
      callback: process.env.PAYTABS_CALLBACK_URL, // your server-side callback URL
      return: "https://yourdomain.com/yourpage", // URL user will return to
      customer_details: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        shippingAddress: req.user.shippingAddress,
      },
    };

    const response = await axios.post(
      "https://secure-egypt.paytabs.com/payment/request",
      payload,
      {
        headers: {
          Authorization: process.env.SERVER_KEY, // replace with your server key
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    // Handle redirection or immediate transaction results
    if (data.redirect_url) {
      // Customer needs to be redirected for 3D Secure, etc.
      return res.json({ redirectUrl: data.redirect_url });
    } else {
      // Transaction processed without redirection
      return res.json(data);
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({
      message: "Payment request failed",
      error: error.response?.data || error.message,
    });
  }
});

export const webhookCheckout = asyncHandler(async (req, res, next) => {
  const timestamp = new Date().toISOString();

  try {
    console.log("=".repeat(60));
    console.log(`🔔 PAYTABS IPN RECEIVED at ${timestamp}`);
    console.log("=".repeat(60));
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("=".repeat(60));

    const paymentData = req.body || req.query;

    const {
      tran_ref,
      cart_id,
      payment_result,
      cart_amount,
      customer_details,
      shipping_details,
      cart_description,
    } = paymentData;

    const responseStatus = payment_result?.response_status;
    const responseCode = payment_result?.response_code;
    const responseMessage = payment_result?.response_message;

    console.log("📊 Parsed Data:");
    console.log("  - Transaction Ref:", tran_ref);
    console.log("  - Cart ID:", cart_id);
    console.log("  - Status:", responseStatus);
    console.log("  - Code:", responseCode);
    console.log("  - Message:", responseMessage);

    // Check if payment is approved (status "A")
    if (responseStatus === "A") {
      console.log("✅ Payment APPROVED for cart:", cart_id);

      // Find the cart
      const cart = await Cart.findById(cart_id);

      if (!cart) {
        console.log("❌ Cart not found:", cart_id);
        return res.status(200).json({
          received: true,
          error: "Cart not found",
        });
      }

      if (!cart.items || cart.items.length === 0) {
        console.log("❌ Cart is empty:", cart_id);
        return res.status(200).json({
          received: true,
          error: "Cart is empty",
        });
      }

      // Create the order - FIXED: Use "card" not "paytabs"
      const order = await Order.create({
        userId: cart.userId,
        cartItems: cart.items,
        paymentMethod: "card", // ✅ FIXED: PayTabs is a card payment
        totalOrderPrice: parseFloat(cart_amount),
        isPaid: true,
        paidAt: Date.now(),
        transactionRef: tran_ref,
        cartDescription: cart_description,
        shippingAddress: {
          name: shipping_details?.name || customer_details?.name,
          details: shipping_details?.street1 || customer_details?.street1, // Use "details" per schema
          city: shipping_details?.city || customer_details?.city,
          phone: customer_details?.phone || "",
          postalCode: shipping_details?.zip || customer_details?.zip || "", // Use "postalCode" per schema
        },
      });

      orderEmitter(order);

      console.log("✅ Order created successfully:", order._id);

      // Clear the cart and update product quantities
      // This function already decrements inventory: quantity: -item.qty, sold: item.qty
      await clearCart(cart);

      console.log("✅ Cart cleared and inventory updated");
    } else {
      console.log("❌ Payment NOT approved. Status:", responseStatus);
      console.log("   Message:", responseMessage);
    }

    console.log("=".repeat(60));

    // IMPORTANT: Always respond with 200
    return res.status(200).json({
      received: true,
      timestamp: timestamp,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("💥 Webhook Error:", error.message);
    console.error("Stack:", error.stack);
    // Still return 200 to prevent retries
    return res.status(200).json({
      received: true,
      error: error.message,
    });
  }
});

export const orderEmitter = async (order) => {
  console.log({ order });
  console.log({ city: order.shippingAddress?.city?.nameAr });
  console.log({ items: order.cartItems[0]?.productId });

  // Format date in Saudi Arabia timezone
  const saudiDate = new Date(order.createdAt).toLocaleDateString("ar-SA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  emailEvent.emit("orderInvoice", {
    orderId: order._id.toString(),
    customerName: order.userId?.name || "غير محدد",
    customerEmail: order.userId?.email || "",
    customerPhone: order.userId?.phone || "",
    orderDate: saudiDate, // Use the formatted Saudi date here
    paymentMethod:
      order.paymentMethod === "cash" ? "الدفع عند الاستلام" : "بطاقة ائتمان",
    city: order.shippingAddress?.city?.nameAr || "غير محدد",
    address: order.shippingAddress?.details || "غير محدد",
    phone: order.shippingAddress?.phone || order.userId?.phone || "",
    items: order.cartItems.map((item) => ({
      name: item.productId?.name || "منتج غير معروف",
      quantity: item.qty || 1,
      unitPrice: (item.unitPrice || 0).toFixed(2),
      total: ((item.unitPrice || 0) * (item.qty || 1)).toFixed(2),
    })),
    subtotal: (order.subTotalPrice || 0).toFixed(2),
    shipping: (order.shippingPrice || 0).toFixed(2),
    grandTotal: (order.totalOrderPrice || 0).toFixed(2),
  });
};
// POST /api/orders/pay-with-paytabs 200 763.423 ms - 120
// ============================================================
// 🔔 PAYTABS IPN RECEIVED at 2025-11-16T06:07:46.849Z
// ============================================================
// Method: POST
// Content-Type: application/json
// Headers: {
//   "host": "neglectful-vanna-robeless.ngrok-free.dev",
//   "user-agent": "IPN/1.0",
//   "content-length": "1287",
//   "accept-encoding": "gzip",
//   "client-key": "CPK266-627T6N-MGDK66-PNGN6T",
//   "content-type": "application/json",
//   "signature": "7439c1ffff899b9120623a398b7428e179ab4ce3fe285e7e66fa8656efbfa56a",
//   "x-forwarded-for": "102.217.68.135",
//   "x-forwarded-host": "neglectful-vanna-robeless.ngrok-free.dev",
//   "x-forwarded-proto": "https"
// }
// Body: {
//   "tran_ref": "TST2532002198164",
//   "merchant_id": 85904,
//   "profile_id": 148004,
//   "cart_id": "691511a991cd1ade8b27b8d6",
//   "cart_description": "طقم اوزان اقراص اولمبي كامل * 2, حامل دامبلز Dumbbell rack 20 pc * 1",
//   "cart_currency": "EGP",
//   "cart_amount": "400.00",
//   "tran_currency": "EGP",
//   "tran_total": "400.00",
//   "tran_type": "Sale",
//   "tran_class": "ECom",
//   "customer_details": {
//     "name": "Mohammed Saleh",
//     "email": "user@gmail.com",
//     "street1": "Address",
//     "city": "Alexandria",
//     "state": "ALX",
//     "country": "EG",
//     "zip": "225",
//     "ip": "41.47.131.225"
//   },
//   "shipping_details": {
//     "name": "Mohammed Saleh",
//     "email": "user@gmail.com",
//     "street1": "Address",
//     "city": "Alexandria",
//     "state": "ALX",
//     "country": "EG",
//     "zip": "225"
//   },
//   "payment_result": {
//     "response_status": "A",
//     "response_code": "G73264",
//     "response_message": "Authorised",
//     "acquirer_ref": "TRAN0001.69196A30.000C88FE",
//     "cvv_result": " ",
//     "avs_result": " ",
//     "transaction_time": "2025-11-16T06:07:44Z"
//   },
//   "payment_info": {
//     "payment_method": "Visa",
//     "card_type": "Credit",
//     "card_scheme": "Visa",
//     "payment_description": "4111 11## #### 1111",
//     "expiryMonth": 12,
//     "expiryYear": 2028
//   },
//   "threeDSDetails": {
//     "responseLevel": 1,
//     "responseStatus": 1,
//     "enrolled": "N",
//     "paResStatus": "",
//     "eci": "",
//     "cavv": "",
//     "ucaf": "",
//     "threeDSVersion": "Test/Simulation"
//   },
//   "ipn_trace": "IPNS0001.69196A30.0000F48A",
//   "paymentChannel": "Payment Page"
// }
// Query: {}
// ============================================================
// 📊 Parsed Data:
//   - Transaction Ref: TST2532002198164
//   - Cart ID: 691511a991cd1ade8b27b8d6
//   - Status: A
//   - Code: G73264
//   - Message: Authorised
// ✅ Payment APPROVED for cart: 691511a991cd1ade8b27b8d6
// 💥 Webhook Error: Error: Order validation failed: paymentMethod: `paytabs` is not a valid enum value for path `paymentMethod`.
//     at ValidationError.inspect (/home/mohammed/Desktop/start_again/action-sports-api/node_modules/mongoose/lib/error/validation.js:52:26)
//     at formatValue (node:internal/util/inspect:829:19)
//     at inspect (node:internal/util/inspect:372:10)
//     at formatWithOptionsInternal (node:internal/util/inspect:2325:40)
//     at formatWithOptions (node:internal/util/inspect:2187:10)
//     at console.value (node:internal/console/constructor:350:14)
//     at console.warn (node:internal/console/constructor:383:61)
//     at file:///home/mohammed/Desktop/start_again/action-sports-api/src/modules/order/order.service.js:562:13
//     at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
//   errors: {
//     paymentMethod: ValidatorError: `paytabs` is not a valid enum value for path `paymentMethod`.
//         at validate (/home/mohammed/Desktop/start_again/action-sports-api/node_modules/mongoose/lib/schemaType.js:1417:13)
//         at SchemaType.doValidate (/home/mohammed/Desktop/start_again/action-sports-api/node_modules/mongoose/lib/schemaType.js:1401:7)
//         at /home/mohammed/Desktop/start_again/action-sports-api/node_modules/mongoose/lib/document.js:3115:18
//         at process.processTicksAndRejections (node:internal/process/task_queues:77:11) {
//       properties: [Object],
//       kind: 'enum',
//       path: 'paymentMethod',
//       value: 'paytabs',
//       reason: undefined,
//       [Symbol(mongoose#validatorError)]: true
//     }
//   },
//   _message: 'Order validation failed'
// }
// Stack: ValidationError: Order validation failed: paymentMethod: `paytabs` is not a valid enum value for path `paymentMethod`.
//     at Document.invalidate (/home/mohammed/Desktop/start_again/action-sports-api/node_modules/mongoose/lib/document.js:3362:32)
//     at /home/mohammed/Desktop/start_again/action-sports-api/node_modules/mongoose/lib/document.js:3123:17
//     at /home/mohammed/Desktop/start_again/action-sports-api/node_modules/mongoose/lib/schemaType.js:1420:9
//     at process.processTicksAndRejections (node:internal/process/task_queues:77:11)
