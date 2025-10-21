import mongoose from "mongoose";
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
  const { connection } = await mongoose.connect(process.env.DB_URI);
  console.log(`Database connected: ${connection.host}`);
};
