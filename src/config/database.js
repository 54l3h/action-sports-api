import mongoose from "mongoose";
import logger from "../utils/logger.js";

/**
 * Asynchronously connects to a MongoDB database using Mongoose.
 *
 * This function reads the MongoDB connection URI from the environment variable `DB_URI`,
 * attempts to establish a connection, and logs the host name of the connected database.
 *
 * @async
 * @function connectToDB
 * @throws {Error} Throws an error if the database connection fails.
 * @returns {Promise<void>} Resolves when the connection is successfully established.
 */
export const connectToDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.DB_URI);
    logger.info(`Database connected successfully: ${connection.host}`);
  } catch (error) {
    logger.error("Database connection failed", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};
