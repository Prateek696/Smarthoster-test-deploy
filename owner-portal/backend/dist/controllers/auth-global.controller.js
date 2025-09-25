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
exports.verifyLoginOTPOriginal = exports.verifyLoginOTPGlobal = exports.sendLoginOTPOriginal = exports.sendLoginOTPGlobal = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongodb_1 = __importDefault(require("../lib/mongodb"));
const auth_schema_1 = require("../validations/auth.schema");
const otp_service_1 = require("../services/otp.service");
const jwt_1 = require("../utils/jwt");
/**
 * @desc Send OTP for login (using global MongoDB connection)
 * This is the NEW version that uses the global connection pattern
 */
const sendLoginOTPGlobal = async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('🔄 sendLoginOTPGlobal: Starting with global connection...');
        // Use global connection pattern
        const client = await mongodb_1.default;
        const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
        const db = client.db(dbName);
        const parsed = auth_schema_1.loginSchema.parse(req.body);
        console.log(`📧 Looking for user: ${parsed.email}`);
        // Check if user exists using native MongoDB client
        const user = await db.collection('users').findOne({ email: parsed.email });
        if (!user) {
            console.log('❌ User not found');
            return res.status(400).json({ message: "Invalid email or password" });
        }
        console.log(`✅ User found: ${user.name}`);
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(parsed.password, user.password);
        if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return res.status(400).json({ message: "Invalid email or password" });
        }
        console.log('✅ Password verified');
        // Send OTP
        const otpSent = await (0, otp_service_1.sendOTP)(parsed.email, 'login');
        if (!otpSent) {
            console.log('❌ Failed to send OTP');
            return res.status(500).json({ message: "Failed to send OTP" });
        }
        const responseTime = Date.now() - startTime;
        console.log(`✅ sendLoginOTPGlobal: Success in ${responseTime}ms`);
        res.json({
            message: "OTP sent to your email",
            connectionType: "global",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ sendLoginOTPGlobal: Error:', error.message);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
            connectionType: "global",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
};
exports.sendLoginOTPGlobal = sendLoginOTPGlobal;
/**
 * @desc Send OTP for login (ORIGINAL mongoose version)
 * This is the OLD version for comparison
 */
const sendLoginOTPOriginal = async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('🔄 sendLoginOTPOriginal: Starting with mongoose connection...');
        // Import mongoose and ensure connection
        const mongoose = await Promise.resolve().then(() => __importStar(require("mongoose")));
        const { ensureDBConnection } = await Promise.resolve().then(() => __importStar(require("../config/db")));
        await ensureDBConnection();
        const parsed = auth_schema_1.loginSchema.parse(req.body);
        console.log(`📧 Looking for user: ${parsed.email}`);
        // Use mongoose model
        const { UserModel } = await Promise.resolve().then(() => __importStar(require("../models/User.model")));
        const user = await UserModel.findOne({ email: parsed.email });
        if (!user) {
            console.log('❌ User not found');
            return res.status(400).json({ message: "Invalid email or password" });
        }
        console.log(`✅ User found: ${user.name}`);
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(parsed.password, user.password);
        if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return res.status(400).json({ message: "Invalid email or password" });
        }
        console.log('✅ Password verified');
        // Send OTP
        const otpSent = await (0, otp_service_1.sendOTP)(parsed.email, 'login');
        if (!otpSent) {
            console.log('❌ Failed to send OTP');
            return res.status(500).json({ message: "Failed to send OTP" });
        }
        const responseTime = Date.now() - startTime;
        console.log(`✅ sendLoginOTPOriginal: Success in ${responseTime}ms`);
        res.json({
            message: "OTP sent to your email",
            connectionType: "mongoose",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ sendLoginOTPOriginal: Error:', error.message);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
            connectionType: "mongoose",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
};
exports.sendLoginOTPOriginal = sendLoginOTPOriginal;
/**
 * @desc Verify OTP and login (using global MongoDB connection)
 * This is the NEW version that uses the global connection pattern
 */
const verifyLoginOTPGlobal = async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('🔄 verifyLoginOTPGlobal: Starting with global connection...');
        // Use global connection pattern
        const client = await mongodb_1.default;
        const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
        const db = client.db(dbName);
        const parsed = auth_schema_1.otpSchema.parse(req.body);
        console.log(`📧 Verifying OTP for: ${parsed.email}`);
        // Verify OTP
        const verification = (0, otp_service_1.verifyOTP)(parsed.email, parsed.otp);
        if (!verification.valid || verification.purpose !== 'login') {
            console.log('❌ Invalid or expired OTP');
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        console.log('✅ OTP verified');
        // Find user using native MongoDB client
        const user = await db.collection('users').findOne({ email: parsed.email });
        if (!user) {
            console.log('❌ User not found');
            return res.status(400).json({ message: "User not found" });
        }
        console.log(`✅ User found: ${user.name}`);
        // Create token payload
        const payload = { id: user._id.toString(), role: user.role };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        const responseTime = Date.now() - startTime;
        console.log(`✅ verifyLoginOTPGlobal: Success in ${responseTime}ms`);
        res.json({
            accessToken,
            refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            },
            connectionType: "global",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ verifyLoginOTPGlobal: Error:', error.message);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
            connectionType: "global",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
};
exports.verifyLoginOTPGlobal = verifyLoginOTPGlobal;
/**
 * @desc Verify OTP and login (ORIGINAL mongoose version)
 * This is the OLD version for comparison
 */
const verifyLoginOTPOriginal = async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('🔄 verifyLoginOTPOriginal: Starting with mongoose connection...');
        // Import mongoose and ensure connection
        const mongoose = await Promise.resolve().then(() => __importStar(require("mongoose")));
        const { ensureDBConnection } = await Promise.resolve().then(() => __importStar(require("../config/db")));
        await ensureDBConnection();
        const parsed = auth_schema_1.otpSchema.parse(req.body);
        console.log(`📧 Verifying OTP for: ${parsed.email}`);
        // Verify OTP
        const verification = (0, otp_service_1.verifyOTP)(parsed.email, parsed.otp);
        if (!verification.valid || verification.purpose !== 'login') {
            console.log('❌ Invalid or expired OTP');
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        console.log('✅ OTP verified');
        // Use mongoose model
        const { UserModel } = await Promise.resolve().then(() => __importStar(require("../models/User.model")));
        const user = await UserModel.findOne({ email: parsed.email });
        if (!user) {
            console.log('❌ User not found');
            return res.status(400).json({ message: "User not found" });
        }
        console.log(`✅ User found: ${user.name}`);
        // Create token payload
        const payload = { id: user._id, role: user.role };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        const responseTime = Date.now() - startTime;
        console.log(`✅ verifyLoginOTPOriginal: Success in ${responseTime}ms`);
        res.json({
            accessToken,
            refreshToken,
            user,
            connectionType: "mongoose",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ verifyLoginOTPOriginal: Error:', error.message);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
            connectionType: "mongoose",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
};
exports.verifyLoginOTPOriginal = verifyLoginOTPOriginal;
