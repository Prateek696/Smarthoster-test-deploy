"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const keepAlive_1 = require("../utils/keepAlive");
const router = (0, express_1.Router)();
// Root route
router.get("/", (req, res) => {
    res.json({
        message: "Smart Hoster Owner Portal API is running!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: "1.0.1",
        endpoints: {
            test: "/test/test",
            admin: "/admin/check-admin-exists",
            health: "/test/health",
            ping: "/test/ping"
        }
    });
});
// Health check endpoint
router.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        mongoUri: process.env.MONGODB_URI ? "Set" : "Not set",
        mongoConnected: mongoose_1.default.connection.readyState === 1
    });
});
// Simple test endpoint that doesn't require database
router.get("/test", (req, res) => {
    res.json({
        message: "Server is working!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        mongoUri: process.env.MONGODB_URI ? "Set" : "Not set"
    });
});
// MongoDB Keep-Alive Ping Endpoint
// This endpoint actually queries MongoDB to keep the cluster awake
// Use this with UptimeRobot or external cron services
router.get("/ping", async (req, res) => {
    try {
        // Ensure the temp collection exists
        await (0, keepAlive_1.ensureTempCollection)();
        // Execute MongoDB query to keep cluster awake
        const pingSuccess = await (0, keepAlive_1.pingMongoDB)();
        if (pingSuccess) {
            res.json({
                status: "success",
                message: "MongoDB cluster is awake",
                timestamp: new Date().toISOString(),
                mongoStatus: (0, keepAlive_1.getMongoDBStatus)(),
                environment: process.env.NODE_ENV
            });
        }
        else {
            res.status(503).json({
                status: "error",
                message: "MongoDB keep-alive failed",
                timestamp: new Date().toISOString(),
                mongoStatus: (0, keepAlive_1.getMongoDBStatus)(),
                environment: process.env.NODE_ENV
            });
        }
    }
    catch (error) {
        console.error("❌ Ping endpoint error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message,
            timestamp: new Date().toISOString(),
            mongoStatus: (0, keepAlive_1.getMongoDBStatus)(),
            environment: process.env.NODE_ENV
        });
    }
});
exports.default = router;
