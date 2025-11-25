import asyncHandler from "express-async-handler";
import User from "../../models/user.model.js";
import Cart from "../../models/cart.model.js";
import Product from "../../models/product.model.js";
import AppError from "../../utils/AppError.js";

// Utility function to calculate total items and price
const calculateTotalItemsAndPrice = (cart) => {
  let totalItems = 0;
  let totalPrice = 0;

  cart.items.forEach((item) => {
    totalItems += item.qty;

    // Line item subtotal = (Unit Price * Quantity) + One-Time Installation Price
    // item.installationPrice is stored on the cart item (see model update below)
    const lineItemSubtotal = item.unitPrice * item.qty + item.installationPrice;

    totalPrice += lineItemSubtotal;
  });

  cart.totalItems = totalItems;
  cart.totalPrice = totalPrice;

  return cart;
};

export const addProductToCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("This product does not exist", 404);
  }

  let cart = await Cart.findOne({ userId });

  // Get the installation price from the product
  const installationPrice = product.installationPrice || 0;

  if (!cart) {
    // Creating a new cart
    cart = await Cart.create({
      userId,
      items: [
        {
          productId,
          unitPrice: product.price,
          qty: 1,
          installationPrice: installationPrice, // Store on cart item
        },
      ],
      // Total price is initial price + one-time installation
      totalPrice: product.price + installationPrice,
      totalItems: 1,
    });
  } else {
    const productIndex = cart.items.findIndex((item) =>
      item.productId.equals(productId)
    );

    if (productIndex > -1) {
      // Incrementing quantity for existing item
      cart.items[productIndex].qty += 1;
      // Installation Price remains the same (one-time charge)
    } else {
      // Adding a new, different item
      cart.items.push({
        productId,
        unitPrice: product.price,
        qty: 1,
        installationPrice: installationPrice, // Store on cart item
      });
    }

    cart = calculateTotalItemsAndPrice(cart);
    await cart.save();
  }

  return res.status(201).json({
    success: true,
    message: "Product added to cart successfully",
    data: cart,
  });
});

/**
 * @description Get logged user cart
 * @route GET /api/cart
 * @access User
 */
export const getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId }).populate({
    path: "items.productId",
    select: "name title images",
  });

  if (!cart) {
    throw new AppError("Your cart is empty you didn't add any item yet", 404);
  }

  return res.status(201).json({
    success: true,
    message: "Cart retrieved successfully",
    data: cart,
  });
});

/**
 * @description Remove cart item
 * @route DELETE /api/cart/:itemId
 * @access User
 */
export const removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  let cart = await Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { _id: itemId } } },
    { new: true }
  );

  if (!cart) {
    throw new AppError("This item is not exist in your cart", 404);
  }

  // Recalculate totals after removal
  cart = calculateTotalItemsAndPrice(cart);
  await cart.save();

  return res.status(200).json({
    success: true,
    message: "Item deleted successfully",
    data: cart,
  });
});

/**
 * @description Clear all items in the logged user's cart
 * @route PATCH /api/cart/clear
 * @access User
 */
export const clearLoggedUserCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const existingCart = await Cart.findOne({ userId });
  if (!existingCart || existingCart.items.length === 0) {
    throw new AppError("Your cart is already empty", 409);
  }

  await Cart.findOneAndUpdate(
    { userId },
    { $set: { items: [], totalPrice: 0, totalItems: 0 } },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
  });
});

/**
 * @description Update specific item quantity
 * @route PATCH /api/cart/:itemId
 * @access User
 */
export const updateSpecificItemQuantity = asyncHandler(
  async (req, res, next) => {
    const userId = req.user._id;
    const { quantity } = req.body;
    const { itemId } = req.params;

    let existingCart = await Cart.findOne({ userId });
    if (!existingCart || existingCart.items.length === 0) {
      throw new AppError("Your cart is already empty", 409);
    }

    const itemIndex = existingCart.items.findIndex((item) => {
      return item._id.equals(itemId);
    });

    if (itemIndex < 0) {
      // Fixed index check from < -1 to < 0
      throw new AppError(
        "This item is not exist in your cart to update its quantity",
        404
      );
    }

    const cartItem = existingCart.items[itemIndex];
    cartItem.qty = quantity;

    // Recalculate totals after quantity update
    existingCart = calculateTotalItemsAndPrice(existingCart);

    await existingCart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: existingCart,
    });
  }
);
