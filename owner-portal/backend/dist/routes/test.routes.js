"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
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
            health: "/test/health"
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
exports.default = router;
