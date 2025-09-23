import mongoose from "mongoose";
import { env } from "./env";

// Cache the connection globally for serverless functions
let cachedConnection: typeof mongoose | null = null;

// Serverless-optimized MongoDB connection settings
const serverlessMongoOptions = {
  serverSelectionTimeoutMS: 3000, // 3 seconds - faster timeout
  connectTimeoutMS: 3000, // 3 seconds - faster timeout
  socketTimeoutMS: 45000, // 45 seconds - longer socket timeout
  maxPoolSize: 1, // Single connection for serverless
  minPoolSize: 0, // No minimum pool
  maxIdleTimeMS: 30000, // Close idle connections after 30s
  bufferCommands: false, // Disable buffering for serverless
  keepAlive: true, // Keep connection alive
  keepAliveInitialDelay: 300000 // 5 minutes
};

// Smart connection function with retry logic
const connectWithRetry = async (retries = 3): Promise<typeof mongoose> => {
  for (let i = 0; i < retries; i++) {
    try {
      // Check if we already have a working connection
      if (cachedConnection?.connection.readyState === 1) {
        console.log("🔄 Reusing existing MongoDB connection");
        return cachedConnection;
      }

      console.log(`🔗 Attempting MongoDB connection (attempt ${i + 1}/${retries})...`);
      
      // Connect with serverless-optimized settings
      await mongoose.connect(env.mongoUri!, serverlessMongoOptions);
      
      // Cache the connection
      cachedConnection = mongoose;
      
      console.log("✅ MongoDB connected successfully");
      console.log("✅ Connection state:", mongoose.connection.readyState);
      
      return mongoose;
    } catch (err: any) {
      console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, err.message);
      
      // If this is the last attempt, throw the error
      if (i === retries - 1) {
        console.error("❌ All MongoDB connection attempts failed");
        throw err;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = 1000 * Math.pow(2, i); // 1s, 2s, 4s
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error("Failed to connect to MongoDB after all retries");
};

export const connectDB = async () => {
  try {
    console.log("🔗 Initializing MongoDB connection...");
    console.log("🔗 MongoDB URI:", env.mongoUri ? "Set" : "Not set");
    
    if (!env.mongoUri) {
      console.log("⚠️ No MongoDB URI provided, skipping connection");
      return;
    }
    
    await connectWithRetry();
  } catch (err: any) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.log("⚠️ App will continue without database connection");
    // Don't throw error, just log it
  }
};

// Export the smart connection function for use in API routes
export const ensureDBConnection = async (): Promise<typeof mongoose> => {
  if (!env.mongoUri) {
    throw new Error("MongoDB URI not configured");
  }
  
  return await connectWithRetry();
};
