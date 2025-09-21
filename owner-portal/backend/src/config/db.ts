import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async () => {
  try {
    console.log("🔗 Attempting to connect to MongoDB...");
    console.log("🔗 MongoDB URI:", env.mongoUri ? "Set" : "Not set");
    
    if (!env.mongoUri) {
      console.log("⚠️ No MongoDB URI provided, skipping connection");
      return;
    }
    
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 10000, // 10 seconds
      maxPoolSize: 1, // Reduce pool size for serverless
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0 // Disable mongoose buffering
    });
    
    console.log("✅ MongoDB connected successfully");
    console.log("✅ Connection state:", mongoose.connection.readyState);
  } catch (err: any) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.log("⚠️ App will continue without database connection");
    // Don't throw error, just log it
  }
};
