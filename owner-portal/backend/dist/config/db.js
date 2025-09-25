"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDBConnection = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
// Cache the connection globally for serverless functions
let cachedConnection = null;
// Ultra-aggressive serverless MongoDB connection settings for Vercel
const serverlessMongoOptions = {
    serverSelectionTimeoutMS: 5000, // 5 seconds - more time for Atlas wake-up
    connectTimeoutMS: 10000, // 10 seconds - longer connection timeout
    socketTimeoutMS: 0, // No socket timeout - let it hang if needed
    maxPoolSize: 1, // Single connection for serverless
    minPoolSize: 0, // No minimum pool
    maxIdleTimeMS: 0, // Never close idle connections
    bufferCommands: true, // Enable buffering for serverless - queue commands until connected
    bufferMaxEntries: 0, // Unlimited buffer size
    retryWrites: true, // Retry failed writes
    retryReads: true // Retry failed reads
};
// Smart connection function with aggressive retry logic for Vercel
const connectWithRetry = async (retries = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            // Check if we already have a working connection
            if (cachedConnection?.connection.readyState === 1) {
                console.log("🔄 Reusing existing MongoDB connection");
                return cachedConnection;
            }
            console.log(`🔗 Attempting MongoDB connection (attempt ${i + 1}/${retries})...`);
            // Connect with ultra-aggressive serverless settings
            await mongoose_1.default.connect(env_1.env.mongoUri, serverlessMongoOptions);
            // Cache the connection
            cachedConnection = mongoose_1.default;
            console.log("✅ MongoDB connected successfully");
            console.log("✅ Connection state:", mongoose_1.default.connection.readyState);
            return mongoose_1.default;
        }
        catch (err) {
            console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, err.message);
            // If this is the last attempt, throw the error
            if (i === retries - 1) {
                console.error("❌ All MongoDB connection attempts failed");
                throw err;
            }
            // Wait before retrying (longer delays for Atlas wake-up)
            const delay = 2000 * (i + 1); // 2s, 4s, 6s, 8s, 10s
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error("Failed to connect to MongoDB after all retries");
};
const connectDB = async () => {
    try {
        console.log("🔗 Initializing MongoDB connection...");
        console.log("🔗 MongoDB URI:", env_1.env.mongoUri ? "Set" : "Not set");
        if (!env_1.env.mongoUri) {
            console.log("⚠️ No MongoDB URI provided, skipping connection");
            return;
        }
        await connectWithRetry();
    }
    catch (err) {
        console.error("❌ MongoDB connection failed:", err.message);
        console.log("⚠️ App will continue without database connection");
        // Don't throw error, just log it
    }
};
exports.connectDB = connectDB;
// Export the smart connection function for use in API routes
const ensureDBConnection = async () => {
    if (!env_1.env.mongoUri) {
        throw new Error("MongoDB URI not configured");
    }
    return await connectWithRetry();
};
exports.ensureDBConnection = ensureDBConnection;
