"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyOTP = exports.requestOTP = exports.showUsername = void 0;
const OTP_model_1 = require("../models/OTP.model");
const User_model_1 = require("../models/User.model");
const mailer_1 = require("../config/mailer");
const otp_1 = require("../utils/otp");
const otp_schema_1 = require("../validations/otp.schema");
const username_schema_1 = require("../validations/username.schema");
const bcrypt_1 = __importDefault(require("bcrypt"));
const OTP_EXPIRATION_MINUTES = 10;
/**
 * @desc Verify OTP and return current username without changing it
 */
const showUsername = async (req, res) => {
    try {
        const { email, code } = username_schema_1.showUsernameSchema.parse(req.body);
        // Verify OTP (valid, unused, not expired)
        const otpEntry = await OTP_model_1.OTPModel.findOne({
            email,
            code,
            expiresAt: { $gt: new Date() },
            used: false,
        });
        if (!otpEntry) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        // Mark OTP as used
        otpEntry.used = true;
        await otpEntry.save();
        // Fetch the current username from the DB
        const user = await User_model_1.UserModel.findOne({ email }).select("name");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            message: "OTP verified successfully",
            username: user.name,
        });
    }
    catch (error) {
        res.status(400).json({ message: error.errors || error.message });
    }
};
exports.showUsername = showUsername;
const requestOTP = async (req, res) => {
    try {
        const { email, purpose } = otp_schema_1.requestOTPSchema.parse(req.body);
        // Check user exists for password reset or username change
        if (purpose === "password-reset" || purpose === "username-change") {
            const user = await User_model_1.UserModel.findOne({ email });
            if (!user)
                return res.status(400).json({ message: "User not found" });
        }
        // Generate OTP
        const code = (0, otp_1.generateOTP)();
        // Save OTP in DB
        await OTP_model_1.OTPModel.create({
            email,
            code,
            purpose,
            expiresAt: new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60000),
        });
        // Send OTP email
        await mailer_1.transporter.sendMail({
            from: `"Owner Portal" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Your OTP Code for ${purpose.replace("-", " ")}`,
            text: `Your OTP code is ${code}. It will expire in ${OTP_EXPIRATION_MINUTES} minutes.`,
        });
        res.json({ message: "OTP sent to email" });
    }
    catch (error) {
        res.status(400).json({ message: error.errors || error.message });
    }
};
exports.requestOTP = requestOTP;
const verifyOTP = async (req, res) => {
    try {
        const { email, code, purpose } = otp_schema_1.verifyOTPSchema.parse(req.body);
        const otpEntry = await OTP_model_1.OTPModel.findOne({
            email,
            code,
            purpose,
            expiresAt: { $gt: new Date() },
            used: false,
        });
        if (!otpEntry)
            return res.status(400).json({ message: "Invalid or expired OTP" });
        // Mark OTP as used
        otpEntry.used = true;
        await otpEntry.save();
        res.json({ message: "OTP verified" });
    }
    catch (error) {
        res.status(400).json({ message: error.errors || error.message });
    }
};
exports.verifyOTP = verifyOTP;
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = otp_schema_1.resetPasswordSchema.parse(req.body);
        // Check OTP is valid and not used
        const otpEntry = await OTP_model_1.OTPModel.findOne({
            email,
            code,
            purpose: "password-reset",
            expiresAt: { $gt: new Date() },
            used: false,
        });
        if (!otpEntry)
            return res.status(400).json({ message: "Invalid or expired OTP" });
        // Mark OTP used
        otpEntry.used = true;
        await otpEntry.save();
        // Hash new password
        const hashed = await bcrypt_1.default.hash(newPassword, 10);
        // Update user password
        const user = await User_model_1.UserModel.findOneAndUpdate({ email }, { password: hashed }, { new: true });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json({ message: "Password reset successful" });
    }
    catch (error) {
        res.status(400).json({ message: error.errors || error.message });
    }
};
exports.resetPassword = resetPassword;
