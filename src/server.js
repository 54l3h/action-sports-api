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

// app.post(
//   "/api/webhook-checkout",
//   express.raw({ type: "application/json" }),
//   webhookCheckout
// );

// Test
// Add this BEFORE your webhook route


// // For Paytabs
// app.post(
//   "/api/payment/paytabs/callback",
//   express.json(),
//   express.urlencoded({ extended: true }),
//   webhookCheckout
// );

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/payment/paytabs/test", (req, res) => {
  res.json({ message: "PayTabs endpoint is reachable", timestamp: new Date() });
});

app.post(
  "/api/payment/paytabs/callback",
  express.json(),
  express.urlencoded({ extended: true }),
  async (req, res) => {
    const timestamp = new Date().toISOString();
    
    try {
      console.log("=".repeat(60));
      console.log(`🔔 PAYTABS IPN RECEIVED at ${timestamp}`);
      console.log("=".repeat(60));
      console.log("Method:", req.method);
      console.log("Content-Type:", req.headers["content-type"]);
      console.log("Headers:", JSON.stringify(req.headers, null, 2));
      console.log("Body:", JSON.stringify(req.body, null, 2));
      console.log("Query:", JSON.stringify(req.query, null, 2));
      console.log("=".repeat(60));

      const paymentData = req.body || req.query;

      const {
        tran_ref,
        cart_id,
        response_status,
        response_code,
        response_message,
      } = paymentData;

      console.log("📊 Parsed Data:");
      console.log("  - Transaction Ref:", tran_ref);
      console.log("  - Cart ID:", cart_id);
      console.log("  - Status:", response_status);
      console.log("  - Code:", response_code);
      console.log("  - Message:", response_message);

      if (response_status === "A") {
        console.log("✅ Payment APPROVED for cart:", cart_id);
        // Call your webhookCheckout function
        await webhookCheckout(paymentData);
      } else {
        console.log("❌ Payment NOT approved. Status:", response_status);
      }

      console.log("=".repeat(60));

      // Always respond with 200
      return res.status(200).json({
        received: true,
        timestamp: timestamp,
        message: "Webhook processed successfully",
      });
    } catch (error) {
      console.error("💥 Webhook Error:", error);
      return res.status(200).json({
        received: true,
        error: error.message,
      });
    }
  }
);

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
