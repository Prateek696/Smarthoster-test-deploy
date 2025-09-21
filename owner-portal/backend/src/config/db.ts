import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async () => {
  try {
    console.log("🔗 Attempting to connect to MongoDB...");
    console.log("🔗 MongoDB URI:", env.mongoUri ? "Set" : "Not set");
    
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      connectTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 30000, // 30 seconds
    });
    
    console.log("✅ MongoDB connected successfully");
    console.log("✅ Connection state:", mongoose.connection.readyState);
  } catch (err: any) {
    console.error("❌ MongoDB connection failed:", err);
    console.error("❌ Error details:", err.message);
    // Don't exit in production, just log the error
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};
