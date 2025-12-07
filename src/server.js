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
import paymentSettingController from "./modules/payment-setting/paymentSetting.controller.js";
import shippingZoneController from "./modules/shipping-zone/shippingZone.controller.js";
import bannerController from "./modules/banner/banner.controller.js";
import errorHandlingMiddleware from "./middlewares/errorHandling.middleware.js";
import AppError from "./utils/AppError.js";
import cors from "cors";
import compression from "compression";
import { webhookCheckout } from "./modules/order/order.service.js";
import cron from "node-cron";
import { cleanupExpiredOTPs } from "./utils/cleanupExpiredOTPs.js";
import logger from "./utils/logger.js";
import cookieParser from "cookie-parser";

dotenv.config();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV;

const app = express();
const allowedOrigins = [
  "https://action-sports-l9o9.vercel.app",
  "http://127.0.0.1:5500",
  "http://localhost:5500", // Add this - some browsers use localhost instead of 127.0.0.1
  "https://dash-admin-one.vercel.app",
];

app.use(cookieParser());

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed: " + origin));
    },
    credentials: true, // Allows cookies to be sent/received
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Explicitly allow methods
    allowedHeaders: ["Content-Type", "Authorization"], // Explicitly allow headers
  })
);

app.use(compression());

// Schedule cleanup job - runs every hour at minute 0
cron.schedule("0 * * * *", () => {
  logger.info("Running scheduled OTP cleanup job");
  cleanupExpiredOTPs();
});

app.post(
  "/api/payment/paytabs/callback",
  express.json(),
  express.urlencoded({ extended: true }),
  webhookCheckout
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (ENV === "DEVELOPMENT") {
  app.use(morgan("dev"));
  logger.info(`Server running in ${ENV} mode`);
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
app.use("/api/payment-settings", paymentSettingController);
app.use("/api/shipping-zones", shippingZoneController);
app.use("/api/banners", bannerController);

// Handle undefined routes
app.use((req, res, next) => {
  return next(new AppError(`Can't find this route: ${req.originalUrl}`, 404));
});

// Error handling middleware
app.use(errorHandlingMiddleware);

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  // logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

// Global Error Handlers
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION - Shutting down...", {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  server.close(() => {
    process.exit(1);
  });
});

process.on("unhandledRejection", async (reason, promise) => {
  logger.error("UNHANDLED REJECTION - Shutting down...", {
    promise,
    reason,
  });
  server.close(() => {
    process.exit(1);
  });
});

await connectToDB();
