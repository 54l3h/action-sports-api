import asyncHandler from "express-async-handler";
import User from "../../models/user.model.js";
import Cart from "../../models/cart.model.js";
import Product from "../../models/product.model.js";
import AppError from "../../utils/AppError.js";

/**
 * Utility function to calculate total items and price.
 * Installation price is stored but NOT added to totalPrice here.
 * Installation will be calculated at checkout based on shipping city.
 */
const calculateTotalItemsAndPrice = async (cart) => {
  let totalItems = 0;
  let totalPrice = 0;
  const updatedItems = [];

  for (const item of cart.items) {
    const latestProduct = await Product.findById(item.productId);

    if (latestProduct) {
      const currentUnitPrice = latestProduct.price;
      const currentInstallationPrice = latestProduct.installationPrice || 0;

      // Update the cart item with latest prices
      item.unitPrice = currentUnitPrice;
      item.installationPrice = currentInstallationPrice;

      // Only add product price (installation added at checkout)
      const lineItemProductsTotal = currentUnitPrice * item.qty;

      totalPrice += lineItemProductsTotal;
      totalItems += item.qty;
    }
    updatedItems.push(item);
  }

  cart.items = updatedItems;
  cart.totalItems = totalItems;
  cart.totalPrice = totalPrice;

  return cart;
};

/**
 * @description Add product to cart
 * @route POST /api/cart
 * @access User
 */
export const addProductToCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("This product does not exist", 404);
  }

  // Check if product is in stock
  if (product.quantity <= 0) {
    throw new AppError("This product is out of stock", 400);
  }

  let cart = await Cart.findOne({ userId });

  const currentInstallationPrice = product.installationPrice || 0;

  if (!cart) {
    cart = new Cart({
      userId,
      items: [
        {
          productId,
          unitPrice: product.price,
          qty: 1,
          installationPrice: currentInstallationPrice,
        },
      ],
      totalPrice: 0,
      totalItems: 0,
    });
  } else {
    const productIndex = cart.items.findIndex((item) =>
      item.productId.equals(productId)
    );

    if (productIndex > -1) {
      const newQty = cart.items[productIndex].qty + 1;

      // Check if requested quantity exceeds available stock
      if (newQty > product.quantity) {
        throw new AppError(
          `Only ${product.quantity} units available in stock`,
          400
        );
      }

      cart.items[productIndex].qty = newQty;
    } else {
      cart.items.push({
        productId,
        unitPrice: product.price,
        qty: 1,
        installationPrice: currentInstallationPrice,
      });
    }
  }

  cart = await calculateTotalItemsAndPrice(cart);
  await cart.save();

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

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new AppError("Your cart is empty you didn't add any item yet", 404);
  }

  cart = await calculateTotalItemsAndPrice(cart);
  await cart.save();

  await cart.populate({
    path: "items.productId",
    select: "name title images installationPrice quantity",
  });

  return res.status(200).json({
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
    throw new AppError("This item does not exist in your cart", 404);
  }

  cart = await calculateTotalItemsAndPrice(cart);
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
      throw new AppError("Your cart is empty", 409);
    }

    const itemIndex = existingCart.items.findIndex((item) => {
      return item._id.equals(itemId);
    });

    if (itemIndex < 0) {
      throw new AppError("This item does not exist in your cart", 404);
    }

    const cartItem = existingCart.items[itemIndex];
    const newQuantity = Math.max(0, parseInt(quantity, 10));

    // Get the product to check stock availability
    const product = await Product.findById(cartItem.productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Check if requested quantity exceeds available stock
    if (newQuantity > product.quantity) {
      throw new AppError(
        `Only ${product.quantity} units available in stock`,
        400
      );
    }

    if (newQuantity === 0) {
      existingCart.items.splice(itemIndex, 1);
    } else {
      cartItem.qty = newQuantity;
    }

    existingCart = await calculateTotalItemsAndPrice(existingCart);
    await existingCart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: existingCart,
    });
  }
);
