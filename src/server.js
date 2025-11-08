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
import compression from "compression";
import { webhookCheckout } from "./modules/order/order.service.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV;

const app = express();
app.use(cors());
app.use(compression());

app.post(
  "/api/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (ENV === "DEVELOPMENT") {
  app.use(morgan("dev"));
  console.log(`mode: ${ENV}`);
}

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
