import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectToDB } from "./config/database.js";
import categoryController from "./modules/category/category.controller.js";
import subCategoryController from "./modules/subcategory/subCategory.controller.js";
import brandController from "./modules/brand/brand.controller.js";
import productController from "./modules/product/product.controller.js";
import userController from "./modules/user/user.controller.js";
import authController from "./modules/auth/auth.controller.js";
import reviewController from "./modules/review/review.controller.js";
import cartController from "./modules/cart/cart.controller.js";
import orderController from "./modules/order/order.controller.js";
import messageController from "./modules/message/message.controller.js";
import errorHandlingMiddleware from "./middlewares/errorHandling.middleware.js";
import AppError from "./utils/AppError.js";
import cors from "cors";
// import { loadStripe } from "@stripe/stripe-js";
// import Stripe from "stripe";

dotenv.config();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV;

const app = express();
app.use(cors());

app.use(express.json());

if (ENV === "DEVELOPMENT") {
  app.use(morgan("dev"));
  console.log(`mode: ${ENV}`);
}

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const YOUR_DOMAIN = process.env.YOUR_DOMAIN || "http://localhost:4242";

// app.post("/api/create-checkout-session", async (req, res, next) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       line_items: [
//         {
//           price: req.body.priceId || "price_1234", // Better to get from request
//           quantity: req.body.quantity || 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `${YOUR_DOMAIN}/success.html`,
//       cancel_url: `${YOUR_DOMAIN}/cancel.html`,
//     });

//     res.status(200).json({ url: session.url });
//   } catch (error) {
//     console.error("Error creating checkout session:", error.message);
//     next(new AppError("Failed to create checkout session", 500));
//   }
// });

// Mount routes
app.use("/api/categories", categoryController);
app.use("/api/subcategories", subCategoryController);
app.use("/api/brands", brandController);
app.use("/api/products", productController);
app.use("/api/users", userController);
app.use("/api/auth", authController);
app.use("/api/reviews", reviewController);
app.use("/api/cart", cartController);
app.use("/api/orders", orderController);
app.use("/api/messages", messageController);

// Handle undefined routes
app.use((req, res, next) => {
  return next(new AppError(`Can't find this route: ${req.originalUrl}`, 404));
});

// Error handling middleware
app.use(errorHandlingMiddleware);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// --- START: Global Error Handlers (Outside Express) ---
// Handle uncaught synchronous exceptions (programming errors)
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION");
  console.error(err.name, err.message, err.stack);
  // Close server first, then exit
  server.close(() => {
    process.exit(1);
  });
});

// Handle unhandled promise rejections (async errors not caught)
process.on("unhandledRejection", async (reason, promise) => {
  console.error("UNHANDLED REJECTION");
  console.error({ promise, reason });
  // Close server first, then exit
  server.close(() => {
    process.exit(1);
  });
});
// --- END: Global Error Handlers ---

await connectToDB();
