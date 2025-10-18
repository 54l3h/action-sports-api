import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectToDB } from "./Database/connection.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV;

if (ENV === "DEVELOPMENT") {
  app.use(morgan("dev"));
  console.log(`mode: ${ENV}`);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

await connectToDB();
