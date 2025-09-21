"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const startServer = async () => {
    await (0, db_1.connectDB)();
    app_1.default.listen(env_1.env.port, () => {
        console.log(`🚀 Server running at http://localhost:${env_1.env.port}`);
    });
};
// For Vercel deployment
if (process.env.NODE_ENV === 'production') {
    // Initialize database connection for Vercel with error handling
    (0, db_1.connectDB)().then(() => {
        console.log('✅ Database connection initialized');
    }).catch((error) => {
        console.error('❌ Database connection failed:', error.message);
        console.log('⚠️ App will continue without database connection');
    });
    // Export the app for Vercel
    module.exports = app_1.default;
}
else {
    // Start server normally for development
    startServer();
}
