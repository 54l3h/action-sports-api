import asyncHandler from "express-async-handler";
import UserModel, { UserRoles } from "../../models/user.model.js";
import Cart from "../../models/cart.model.js";
import Product from "../../models/product.model.js";
import Order, { ORDER_DELIVERY_STATUS } from "../../models/order.model.js";
import ShippingZones from "../../models/shippingZones.model.js";
import AppError from "../../utils/AppError.js";
import axios from "axios";
import { emailEvent } from "../../utils/events/email.event.js";

/**
 * @description Create cash order
 * @route POST /api/orders
 * @access User
 */
export const createCashOrder = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const shippingZoneId = req.body.shippingAddress.city;
  const shippingZone = await ShippingZones.findById(shippingZoneId);

  if (!shippingZone) {
    throw new AppError("Invalid shipping city.", 400);
  }

  const taxPrice = 0;

  const cart = await Cart.findOne({ userId: req.user._id });

  if (!cart || cart.items.length === 0) {
    throw new AppError("Your cart is empty, cannot create order", 409);
  }

  // Calculate total installation price from cart items
  const totalInstallationPrice = cart.items.reduce((acc, item) => {
    return acc + (item.installationPrice || 0);
  }, 0);

  // 1. Installation Check: Reject if installation is required but not supported
  // NOTE: Per user request, we are removing the immediate rejection to allow order creation
  // and handle the installation eligibility mismatch during fulfillment or manual review.
  if (totalInstallationPrice > 0 && !shippingZone.isInstallationAvailable) {
    throw new AppError(
      "We do not support installation at your shipping address for the items selected. Please remove the installation option or change the shipping address.",
      409
    );
  }

  const shippingPrice = shippingZone.shippingRate || 0;

  // cart.totalPrice already includes product prices and all installation prices (Subtotal)
  const subTotalPrice = cart.totalPrice;
  const totalOrderPrice = subTotalPrice + taxPrice + shippingPrice;

  // Create order with default payment method (cash)
  const createdOrder = await Order.create({
    userId,
    cartItems: cart.items,
    shippingPrice,
    subTotalPrice: subTotalPrice,
    totalInstallationPrice,
    totalOrderPrice,
    shippingAddress: req.body.shippingAddress,
    paymentMethod: "cash",
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
 * @route GET /api/orders/:id
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
 * @route GET /api/orders/user
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
 * @access Admin
 */
export const updateOrderDeliveryStatus = asyncHandler(
  async (req, res, next) => {
    const { id, status } = req.params;

    if (!Object.values(ORDER_DELIVERY_STATUS).includes(status)) {
      throw new AppError("Invalid delivery status", 400);
    }

    const order = await Order.findById(id);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

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

export const payWithPayTabs = asyncHandler(async (req, res, next) => {
  try {
    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.productId",
      "name"
    );

    if (!cart || cart.items.length === 0) {
      throw new AppError("Your cart is already empty", 409);
    }

    // Build cart description
    const cartItems = cart.items;
    const cartDescriptionArray = cartItems.map((item) => {
      return `${item.productId.name} * ${item.qty}`;
    });
    const cartDescription = cartDescriptionArray.join(", ");

    const shippingAddress = req.body.shippingAddress;

    if (!shippingAddress || !shippingAddress.city) {
      throw new AppError(
        "Please provide shipping address in request body",
        400
      );
    }

    await UserModel.findByIdAndUpdate(req.user._id, {
      shippingAddress,
    });

    // Get shipping zone details
    const shippingZone = await ShippingZones.findById(shippingAddress.city);

    if (!shippingZone) {
      throw new AppError("Invalid shipping city", 400);
    }

    // Calculate total installation price from cart items
    const totalInstallationPrice = cart.items.reduce((acc, item) => {
      return acc + (item.installationPrice || 0);
    }, 0);

    if (totalInstallationPrice > 0 && !shippingZone.isInstallationAvailable) {
      throw new AppError(
        "We do not support installation at your shipping address for the items selected. Please remove the installation option or change the shipping address.",
        409
      );
    }

    const shippingPrice = shippingZone.shippingRate || 0;
    // cart.totalPrice already includes product prices and installation prices
    const subTotalPrice = cart.totalPrice;
    const cart_amount = subTotalPrice + shippingPrice;

    // Prepare PayTabs payload with proper billing address
    const payload = {
      profile_id: process.env.PAYTABS_PROFILE_ID,
      tran_type: "sale",
      tran_class: "ecom",
      cart_id: cart._id.toString(),
      cart_description: cartDescription,
      cart_currency: "EGP",
      cart_amount: cart_amount, // Total price including shipping and installation
      callback: process.env.PAYTABS_CALLBACK_URL,
      return:
        process.env.PAYTABS_RETURN_URL ||
        "https://yourdomain.com/payment/success",

      // Proper customer details with billing address
      customer_details: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || shippingAddress.phone,
        street1: shippingAddress.details || "Not provided",
        city: shippingZone.nameEn || shippingZone.nameAr,
        state: shippingZone.nameEn || shippingZone.nameAr,
        country: "EG",
        zip: shippingAddress.postalCode || "00000",
      },
    };

    // Make request to PayTabs
    const response = await axios.post(
      "https://secure-egypt.paytabs.com/payment/request",
      payload,
      {
        headers: {
          Authorization: process.env.PAYTABS_SERVER_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    if (data.redirect_url) {
      return res.json({
        success: true,
        redirectUrl: data.redirect_url,
        tran_ref: data.tran_ref,
      });
    } else {
      return res.json({
        success: true,
        data,
      });
    }
  } catch (error) {
    console.error("PayTabs Error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Payment request failed",
      error: error.message || error.response?.data,
    });
  }
});

export const webhookCheckout = asyncHandler(async (req, res, next) => {
  const timestamp = new Date().toISOString();

  try {
    const paymentData = req.body || req.query;

    const { tran_ref, cart_id, payment_result, cart_description } = paymentData;

    const responseStatus = payment_result?.response_status;

    if (responseStatus === "A") {
      const cart = await Cart.findById(cart_id);

      if (!cart || cart.items.length === 0) {
        return res
          .status(200)
          .json({ received: true, error: "Cart not found or empty" });
      }

      const user = await UserModel.findById(cart.userId);

      if (!user) {
        return res
          .status(200)
          .json({ received: true, error: "User not found" });
      }

      const shippingAddress = user.shippingAddress;

      // Get shipping zone for price calculation
      const shippingZone = await ShippingZones.findById(shippingAddress?.city);
      const shippingPrice = shippingZone?.shippingRate || 0;

      // Calculate total installation price from cart items
      const totalInstallationPrice = cart.items.reduce((acc, item) => {
        return acc + (item.installationPrice || 0);
      }, 0);

      // NOTE: We do not check for installation eligibility here, as per the
      // policy to proceed with order creation and validate later.

      // cart.totalPrice includes products and installation fees (Subtotal)
      const subTotalPrice = cart.totalPrice;
      const totalOrderPrice = subTotalPrice + shippingPrice;

      // Create the order
      const createdOrder = await Order.create({
        userId: cart.userId,
        cartItems: cart.items,
        paymentMethod: "card",
        subTotalPrice: subTotalPrice,
        shippingPrice: shippingPrice,
        totalInstallationPrice,
        totalOrderPrice: totalOrderPrice,
        isPaid: true,
        paidAt: Date.now(),
        transactionRef: tran_ref,
        cartDescription: cart_description,
        shippingAddress: {
          details: shippingAddress?.details || "",
          city: shippingAddress?.city || null,
          phone: shippingAddress?.phone || user.phone || "",
          postalCode: shippingAddress?.postalCode || "",
        },
      });

      const order = await Order.findById(createdOrder._id);
      orderEmitter(order);

      await clearCart(cart);
    }

    return res.status(200).json({
      received: true,
      timestamp: timestamp,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("💥 Webhook Error:", error.message);
    return res.status(200).json({
      received: true,
      error: error.message,
    });
  }
});

export const orderEmitter = async (order) => {
  // Read the total installation price directly from the order document
  const totalInstallationPrice = order.totalInstallationPrice || 0;

  const saudiDate = new Date(order.createdAt).toLocaleDateString("ar-SA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  let paymentMethodText;
  if (order.paymentMethod === "cash") {
    paymentMethodText = "الدفع عند الاستلام";
  } else if (
    order.paymentMethod === "card" ||
    order.paymentMethod === "paytabs"
  ) {
    paymentMethodText = "بطاقة ائتمان / دفع إلكتروني";
  } else {
    paymentMethodText = "غير محدد";
  }

  emailEvent.emit("orderInvoice", {
    orderId: order._id.toString(),
    customerName: order.userId?.name || "غير محدد",
    customerEmail: order.userId?.email || "",
    customerPhone: order.userId?.phone || "",
    orderDate: saudiDate,
    paymentMethod: paymentMethodText,
    city: order.shippingAddress?.city?.nameAr || "غير محدد",
    address: order.shippingAddress?.details || "غير محدد",
    phone: order.shippingAddress?.phone || order.userId?.phone || "",
    items: order.cartItems.map((item) => ({
      name: item.productId?.name || "منتج غير معروف",
      quantity: item.qty || 1,
      unitPrice: (item.unitPrice || 0).toFixed(2),
      // Individual installation price for line item display
      installationPrice: (item.installationPrice || 0).toFixed(2),
      // Total price for the line item (Products + Installation)
      total: (
        (item.unitPrice || 0) * (item.qty || 1) +
        (item.installationPrice || 0)
      ).toFixed(2),
    })),
    // The total installation fee for the entire order
    totalInstallation: totalInstallationPrice.toFixed(2),
    subtotal: (order.subTotalPrice || 0).toFixed(2),
    shipping: (order.shippingPrice || 0).toFixed(2),
    grandTotal: (order.totalOrderPrice || 0).toFixed(2),
  });
};

// paytabs response
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
