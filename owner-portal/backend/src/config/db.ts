import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
};
