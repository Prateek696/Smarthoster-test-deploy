"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = __importDefault(require("../lib/mongodb"));
const router = (0, express_1.Router)();
// Test route to verify global MongoDB connection pattern
router.get("/test-global-connection", async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('🔄 Testing global MongoDB connection...');
        // Use the global connection pattern
        const client = await mongodb_1.default;
        // Extract database name from URI or use default
        const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
        const db = client.db(dbName);
        // Test query to users collection
        const userCount = await db.collection('users').countDocuments();
        const responseTime = Date.now() - startTime;
        console.log(`✅ Global connection test successful: ${responseTime}ms`);
        res.json({
            status: "success",
            message: "Global MongoDB connection working",
            userCount: userCount,
            responseTime: `${responseTime}ms`,
            connectionType: "global",
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Global connection test failed:', error.message);
        res.status(500).json({
            status: "error",
            message: "Global MongoDB connection failed",
            error: error.message,
            responseTime: `${responseTime}ms`,
            connectionType: "global",
            timestamp: new Date().toISOString()
        });
    }
});
// Test route using old connection pattern for comparison
router.get("/test-old-connection", async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('🔄 Testing old MongoDB connection...');
        // Import the old connection method
        const { connectDB } = await Promise.resolve().then(() => __importStar(require('../config/db')));
        const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
        // Ensure connection
        if (mongoose.default.connection.readyState !== 1) {
            await connectDB();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        // Test query using mongoose
        const User = mongoose.default.models.User || mongoose.default.model('User', new mongoose.default.Schema({}, { strict: false }));
        const userCount = await User.countDocuments();
        const responseTime = Date.now() - startTime;
        console.log(`✅ Old connection test successful: ${responseTime}ms`);
        res.json({
            status: "success",
            message: "Old MongoDB connection working",
            userCount: userCount,
            responseTime: `${responseTime}ms`,
            connectionType: "mongoose",
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Old connection test failed:', error.message);
        res.status(500).json({
            status: "error",
            message: "Old MongoDB connection failed",
            error: error.message,
            responseTime: `${responseTime}ms`,
            connectionType: "mongoose",
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
