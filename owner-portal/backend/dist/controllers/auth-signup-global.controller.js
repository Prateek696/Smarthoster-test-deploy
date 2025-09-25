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
exports.verifySignupOTPOriginal = exports.verifySignupOTPGlobal = exports.sendSignupOTPOriginal = exports.sendSignupOTPGlobal = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongodb_1 = __importDefault(require("../lib/mongodb"));
const auth_schema_1 = require("../validations/auth.schema");
const otp_service_1 = require("../services/otp.service");
const jwt_1 = require("../utils/jwt");
/**
 * @desc Send OTP for signup (using global MongoDB connection)
 * This is the NEW version that uses the global connection pattern
 */
const sendSignupOTPGlobal = async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('🔄 sendSignupOTPGlobal: Starting with global connection...');
        // Use global connection pattern
        const client = await mongodb_1.default;
        const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
        const db = client.db(dbName);
        const parsed = auth_schema_1.signupSchema.parse(req.body);
        console.log(`📧 Checking signup for: ${parsed.email}`);
        // Check if email already exists using native MongoDB client
        const existing = await db.collection('users').findOne({ email: parsed.email });
        if (existing) {
            console.log('❌ Email already exists');
            return res.status(400).json({ message: "Email already exists" });
        }
        console.log('✅ Email is available');
        // Check if trying to signup as admin and admin already exists
        if (parsed.role === 'admin') {
            const adminExists = await db.collection('users').findOne({ role: 'admin' });
            if (adminExists) {
                console.log('❌ Admin account already exists');
                return res.status(400).json({ message: "Admin account already exists. Only one admin is allowed." });
            }
        }
        console.log('✅ Role validation passed');
        // Send OTP
        const otpSent = await (0, otp_service_1.sendOTP)(parsed.email, 'signup');
        if (!otpSent) {
            console.log('❌ Failed to send OTP');
            return res.status(500).json({ message: "Failed to send OTP" });
        }
        const responseTime = Date.now() - startTime;
        console.log(`✅ sendSignupOTPGlobal: Success in ${responseTime}ms`);
        res.json({
            message: "OTP sent to your email",
            connectionType: "global",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ sendSignupOTPGlobal: Error:', error.message);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
            connectionType: "global",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
};
exports.sendSignupOTPGlobal = sendSignupOTPGlobal;
/**
 * @desc Send OTP for signup (ORIGINAL mongoose version)
 * This is the OLD version for comparison
 */
const sendSignupOTPOriginal = async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('🔄 sendSignupOTPOriginal: Starting with mongoose connection...');
        // Import mongoose and ensure connection
        const mongoose = await Promise.resolve().then(() => __importStar(require("mongoose")));
        const { ensureDBConnection } = await Promise.resolve().then(() => __importStar(require("../config/db")));
        await ensureDBConnection();
        const parsed = auth_schema_1.signupSchema.parse(req.body);
        console.log(`📧 Checking signup for: ${parsed.email}`);
        // Use mongoose model
        const { UserModel } = await Promise.resolve().then(() => __importStar(require("../models/User.model")));
        const existing = await UserModel.findOne({ email: parsed.email });
        if (existing) {
            console.log('❌ Email already exists');
            return res.status(400).json({ message: "Email already exists" });
        }
        console.log('✅ Email is available');
        // Check if trying to signup as admin and admin already exists
        if (parsed.role === 'admin') {
            const adminExists = await UserModel.findOne({ role: 'admin' });
            if (adminExists) {
                console.log('❌ Admin account already exists');
                return res.status(400).json({ message: "Admin account already exists. Only one admin is allowed." });
            }
        }
        console.log('✅ Role validation passed');
        // Send OTP
        const otpSent = await (0, otp_service_1.sendOTP)(parsed.email, 'signup');
        if (!otpSent) {
            console.log('❌ Failed to send OTP');
            return res.status(500).json({ message: "Failed to send OTP" });
        }
        const responseTime = Date.now() - startTime;
        console.log(`✅ sendSignupOTPOriginal: Success in ${responseTime}ms`);
        res.json({
            message: "OTP sent to your email",
            connectionType: "mongoose",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ sendSignupOTPOriginal: Error:', error.message);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
            connectionType: "mongoose",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
};
exports.sendSignupOTPOriginal = sendSignupOTPOriginal;
/**
 * @desc Verify OTP and create account (using global MongoDB connection)
 * This is the NEW version that uses the global connection pattern
 */
const verifySignupOTPGlobal = async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('🔄 verifySignupOTPGlobal: Starting with global connection...');
        // Use global connection pattern
        const client = await mongodb_1.default;
        const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
        const db = client.db(dbName);
        const { email, otp, name, phone, password, role } = req.body;
        console.log(`📧 Verifying signup OTP for: ${email}`);
        // Verify OTP
        const verification = (0, otp_service_1.verifyOTP)(email, otp);
        if (!verification.valid || verification.purpose !== 'signup') {
            console.log('❌ Invalid or expired OTP');
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        console.log('✅ OTP verified');
        // Check if email already exists using native MongoDB client
        const existing = await db.collection('users').findOne({ email });
        if (existing) {
            console.log('❌ Email already exists');
            return res.status(400).json({ message: "Email already exists" });
        }
        console.log('✅ Email is available');
        // Check if trying to signup as admin and admin already exists
        if (role === 'admin') {
            const adminExists = await db.collection('users').findOne({ role: 'admin' });
            if (adminExists) {
                console.log('❌ Admin account already exists');
                return res.status(400).json({ message: "Admin account already exists. Only one admin is allowed." });
            }
        }
        console.log('✅ Role validation passed');
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        console.log('✅ Password hashed');
        // Create user using native MongoDB client
        const userData = {
            name,
            email,
            phone,
            password: hashedPassword,
            role: role || 'user',
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await db.collection('users').insertOne(userData);
        const user = { _id: result.insertedId, ...userData };
        console.log(`✅ User created: ${user.name}`);
        // Create token payload
        const payload = { id: user._id.toString(), role: user.role };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        const responseTime = Date.now() - startTime;
        console.log(`✅ verifySignupOTPGlobal: Success in ${responseTime}ms`);
        res.status(201).json({
            accessToken,
            refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            connectionType: "global",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ verifySignupOTPGlobal: Error:', error.message);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
            connectionType: "global",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
};
exports.verifySignupOTPGlobal = verifySignupOTPGlobal;
/**
 * @desc Verify OTP and create account (ORIGINAL mongoose version)
 * This is the OLD version for comparison
 */
const verifySignupOTPOriginal = async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('🔄 verifySignupOTPOriginal: Starting with mongoose connection...');
        // Import mongoose and ensure connection
        const mongoose = await Promise.resolve().then(() => __importStar(require("mongoose")));
        const { ensureDBConnection } = await Promise.resolve().then(() => __importStar(require("../config/db")));
        await ensureDBConnection();
        const { email, otp, name, phone, password, role } = req.body;
        console.log(`📧 Verifying signup OTP for: ${email}`);
        // Verify OTP
        const verification = (0, otp_service_1.verifyOTP)(email, otp);
        if (!verification.valid || verification.purpose !== 'signup') {
            console.log('❌ Invalid or expired OTP');
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        console.log('✅ OTP verified');
        // Use mongoose model
        const { UserModel } = await Promise.resolve().then(() => __importStar(require("../models/User.model")));
        const existing = await UserModel.findOne({ email });
        if (existing) {
            console.log('❌ Email already exists');
            return res.status(400).json({ message: "Email already exists" });
        }
        console.log('✅ Email is available');
        // Check if trying to signup as admin and admin already exists
        if (role === 'admin') {
            const adminExists = await UserModel.findOne({ role: 'admin' });
            if (adminExists) {
                console.log('❌ Admin account already exists');
                return res.status(400).json({ message: "Admin account already exists. Only one admin is allowed." });
            }
        }
        console.log('✅ Role validation passed');
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        console.log('✅ Password hashed');
        // Create user using mongoose
        const user = await UserModel.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role: role || 'user',
            isVerified: true,
        });
        console.log(`✅ User created: ${user.name}`);
        // Create token payload
        const payload = { id: user._id, role: user.role };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        const responseTime = Date.now() - startTime;
        console.log(`✅ verifySignupOTPOriginal: Success in ${responseTime}ms`);
        res.status(201).json({
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
        console.error('❌ verifySignupOTPOriginal: Error:', error.message);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
            connectionType: "mongoose",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
};
exports.verifySignupOTPOriginal = verifySignupOTPOriginal;
