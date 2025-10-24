import fs from "fs";
import colors from "colors";
import dotenv from "dotenv";
import Product from "../../models/product.model.js";
import { connectToDB } from "../../config/database.js";

dotenv.config({ path: "../../../.env" });

// connect to DB
await connectToDB();

// Read data
const products = JSON.parse(fs.readFileSync("./products.json", "utf-8"));

// Insert data into DB
const insertData = async () => {
  try {
    await Product.create(products);
    console.log("Data Inserted".green.inverse);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log("Data Destroyed".red.inverse);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Run command
if (process.argv[2] === "-i") {
  insertData();
} else if (process.argv[2] === "-d") {
  destroyData();
}
