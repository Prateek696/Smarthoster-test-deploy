"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.sendForgotPasswordOTP = exports.me = exports.verifySignupOTP = exports.verifyLoginOTP = exports.sendSignupOTP = exports.sendLoginOTP = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_model_1 = require("../models/User.model");
const auth_schema_1 = require("../validations/auth.schema");
const jwt_1 = require("../utils/jwt");
const otp_service_1 = require("../services/otp.service");
const db_1 = require("../config/db");
/**
 * @desc Send OTP for login (after password verification)
 */
const sendLoginOTP = async (req, res) => {
    try {
        // Ensure database connection before proceeding
        await (0, db_1.ensureDBConnection)();
        const parsed = auth_schema_1.loginSchema.parse(req.body);
        // Check if user exists
        const user = await User_model_1.UserModel.findOne({ email: parsed.email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(parsed.password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        // Send OTP
        const otpSent = await (0, otp_service_1.sendOTP)(parsed.email, 'login');
        if (!otpSent) {
            return res.status(500).json({ message: "Failed to send OTP" });
        }
        res.json({ message: "OTP sent to your email" });
    }
    catch (error) {
        res.status(400).json({ message: error.errors || error.message });
    }
};
exports.sendLoginOTP = sendLoginOTP;
/**
 * @desc Send OTP for signup
 */
const sendSignupOTP = async (req, res) => {
    try {
        const parsed = auth_schema_1.signupSchema.parse(req.body);
        // Check if email already exists
        const existing = await User_model_1.UserModel.findOne({ email: parsed.email });
        if (existing) {
            return res.status(400).json({ message: "Email already exists" });
        }
        // Check if trying to signup as admin and admin already exists
        if (parsed.role === 'admin') {
            const adminExists = await User_model_1.UserModel.findOne({ role: 'admin' });
            if (adminExists) {
                return res.status(400).json({ message: "Admin account already exists. Only one admin is allowed." });
            }
        }
        // Send OTP
        const otpSent = await (0, otp_service_1.sendOTP)(parsed.email, 'signup');
        if (!otpSent) {
            return res.status(500).json({ message: "Failed to send OTP" });
        }
        res.json({ message: "OTP sent to your email" });
    }
    catch (error) {
        res.status(400).json({ message: error.errors || error.message });
    }
};
exports.sendSignupOTP = sendSignupOTP;
/**
 * @desc Verify OTP and login
 */
const verifyLoginOTP = async (req, res) => {
    try {
        const parsed = auth_schema_1.otpSchema.parse(req.body);
        // Verify OTP
        const verification = (0, otp_service_1.verifyOTP)(parsed.email, parsed.otp);
        if (!verification) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        // Find user
        const user = await User_model_1.UserModel.findOne({ email: parsed.email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        // Create token payload
        const payload = { id: user._id, role: user.role };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        res.json({ accessToken, refreshToken, user });
    }
    catch (error) {
        res.status(400).json({ message: error.errors || error.message });
    }
};
exports.verifyLoginOTP = verifyLoginOTP;
/**
 * @desc Verify OTP and create account
 */
const verifySignupOTP = async (req, res) => {
    try {
        const { email, otp, name, phone, password, role } = req.body;
        // Verify OTP
        const verification = (0, otp_service_1.verifyOTP)(email, otp);
        if (!verification) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        // Check if email already exists
        const existing = await User_model_1.UserModel.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email already exists" });
        }
        // Check if trying to signup as admin and admin already exists
        if (role === 'admin') {
            const adminExists = await User_model_1.UserModel.findOne({ role: 'admin' });
            if (adminExists) {
                return res.status(400).json({ message: "Admin account already exists. Only one admin is allowed." });
            }
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const user = await User_model_1.UserModel.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role: role || 'user',
            isVerified: true,
        });
        // Create token payload
        const payload = { id: user._id, role: user.role };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        res.status(201).json({ accessToken, refreshToken, user });
    }
    catch (error) {
        res.status(400).json({ message: error.errors || error.message });
    }
};
exports.verifySignupOTP = verifySignupOTP;
/**
 * @desc Get current user from DB (Protected route)
 */
const me = async (req, res) => {
    try {
        // fetch user by id from JWT payload
        const user = await User_model_1.UserModel.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.me = me;
/**
 * @desc Send OTP for forgot password
 */
const sendForgotPasswordOTP = async (req, res) => {
    try {
        const parsed = auth_schema_1.forgotPasswordSchema.parse(req.body);
        // Check if user exists
        const user = await User_model_1.UserModel.findOne({ email: parsed.email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        // Send OTP
        const otpSent = await (0, otp_service_1.sendOTP)(parsed.email, 'forgot-password');
        if (!otpSent) {
            return res.status(500).json({ message: "Failed to send OTP" });
        }
        res.json({ message: "OTP sent to your email" });
    }
    catch (error) {
        res.status(400).json({ message: error.errors || error.message });
    }
};
exports.sendForgotPasswordOTP = sendForgotPasswordOTP;
/**
 * @desc Reset password with OTP verification
 */
const resetPassword = async (req, res) => {
    try {
        const parsed = auth_schema_1.resetPasswordSchema.parse(req.body);
        // Verify OTP
        const verification = (0, otp_service_1.verifyOTP)(parsed.email, parsed.otp);
        if (!verification) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        // Check if user exists
        const user = await User_model_1.UserModel.findOne({ email: parsed.email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(parsed.newPassword, 12);
        // Update password
        await User_model_1.UserModel.findByIdAndUpdate(user._id, { password: hashedPassword });
        res.json({ message: "Password reset successfully" });
    }
    catch (error) {
        res.status(400).json({ message: error.errors || error.message });
    }
};
exports.resetPassword = resetPassword;
