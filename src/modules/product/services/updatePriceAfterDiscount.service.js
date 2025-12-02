import asyncHandler from "express-async-handler";
import Product from "../../../models/product.model.js";

export const updatePriceAfterDiscount = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { priceAfterDiscount } = req.body;

  const product = await Product.findByIdAndUpdate(
    id,
    {
      priceAfterDiscount,
    },
    { new: true }
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Product price after discount updated successfully",
    data: product,
  });
});
