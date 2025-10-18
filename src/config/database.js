import mongoose from "mongoose";

export const connectToDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.DB_URI);
    console.log(`Database connected: ${connection.host}`);
  } catch (error) {
    throw error;
  }
};
