import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectToDB } from "./config/database.js";
import categoryController from "./modules/category/category.controller.js";
import errorHandlingMiddleware from "./middlewares/errorHandling.middleware.js";
import AppError from "./utils/AppError.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV;

const app = express();

app.use(express.json());

// Mount routes
app.use("/api/category", categoryController);

// Handle undefined routes
app.use((req, res, next) => {
  return next(new AppError(`Can't find this route: ${req.originalUrl}`, 404));
});

// Error handling middleware
app.use(errorHandlingMiddleware);

if (ENV === "DEVELOPMENT") {
  app.use(morgan("dev"));
  console.log(`mode: ${ENV}`);
}

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
