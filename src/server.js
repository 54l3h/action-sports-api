import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectToDB } from "./config/database.js";
import categoryController from "./modules/category/category.controller.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV;

const app = express();

app.use(express.json());
app.use("/api/category", categoryController);

if (ENV === "DEVELOPMENT") {
  app.use(morgan("dev"));
  console.log(`mode: ${ENV}`);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

await connectToDB();
