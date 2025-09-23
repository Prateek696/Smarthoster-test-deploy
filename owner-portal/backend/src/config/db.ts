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
      serverSelectionTimeoutMS: 5000, // 5 seconds - faster timeout
      connectTimeoutMS: 5000, // 5 seconds - faster timeout
      socketTimeoutMS: 45000, // 45 seconds - longer socket timeout
      maxPoolSize: 1, // Reduce pool size for serverless
      minPoolSize: 0, // No minimum pool for serverless
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      bufferCommands: false // Disable buffering for serverless
    });
    
    console.log("✅ MongoDB connected successfully");
    console.log("✅ Connection state:", mongoose.connection.readyState);
  } catch (err: any) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.log("⚠️ App will continue without database connection");
    // Don't throw error, just log it
  }
};
