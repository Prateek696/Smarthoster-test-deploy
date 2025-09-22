"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDB = async () => {
    try {
        console.log("🔗 Attempting to connect to MongoDB...");
        console.log("🔗 MongoDB URI:", env_1.env.mongoUri ? "Set" : "Not set");
        if (!env_1.env.mongoUri) {
            console.log("⚠️ No MongoDB URI provided, skipping connection");
            return;
        }
        await mongoose_1.default.connect(env_1.env.mongoUri, {
            serverSelectionTimeoutMS: 10000, // 10 seconds
            connectTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 10000, // 10 seconds
            maxPoolSize: 1 // Reduce pool size for serverless
        });
        console.log("✅ MongoDB connected successfully");
        console.log("✅ Connection state:", mongoose_1.default.connection.readyState);
    }
    catch (err) {
        console.error("❌ MongoDB connection failed:", err.message);
        console.log("⚠️ App will continue without database connection");
        // Don't throw error, just log it
    }
};
exports.connectDB = connectDB;
