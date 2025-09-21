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
exports.cleanupExpiredOTPs = exports.verifyOTP = exports.sendOTP = exports.generateOTP = void 0;
const nodemailer = __importStar(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
// In-memory storage for OTPs (in production, use Redis)
const otpStorage = new Map();
// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
    return crypto_1.default.randomInt(100000, 999999).toString();
};
exports.generateOTP = generateOTP;
/**
 * Send OTP via email
 */
const sendOTP = async (email, purpose) => {
    try {
        const otp = (0, exports.generateOTP)();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Store OTP in memory
        const otpData = {
            email,
            otp,
            expiresAt,
            purpose,
        };
        otpStorage.set(email, otpData);
        console.log(`💾 Stored OTP for ${email}:`, otpData);
        // Email content
        const subject = purpose === 'login' ? 'Login OTP' : purpose === 'signup' ? 'Account Verification OTP' : 'Password Reset OTP';
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Property Management Portal</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">${purpose === 'login' ? 'Login Verification' : purpose === 'signup' ? 'Account Verification' : 'Password Reset Verification'}</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            ${purpose === 'login'
            ? 'Use the following OTP to complete your login:'
            : purpose === 'signup'
                ? 'Use the following OTP to verify your account:'
                : 'Use the following OTP to reset your password:'}
          </p>
          
          <div style="background: white; border: 2px dashed #10b981; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 5px;">${otp}</span>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This OTP will expire in <strong>10 minutes</strong>.
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>If you didn't request this ${purpose === 'login' ? 'login' : purpose === 'signup' ? 'verification' : 'password reset'}, please ignore this email.</p>
          <p>© 2024 Property Management Portal. All rights reserved.</p>
        </div>
      </div>
    `;
        // Send email
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject,
            html: htmlContent,
        });
        console.log(`✅ OTP sent to ${email}: ${otp}`);
        return true;
    }
    catch (error) {
        console.error('❌ Error sending OTP:', error);
        return false;
    }
};
exports.sendOTP = sendOTP;
/**
 * Verify OTP
 */
const verifyOTP = (email, otp) => {
    const storedData = otpStorage.get(email);
    console.log(`🔍 Verifying OTP for ${email}:`);
    console.log(`   Stored data:`, storedData);
    console.log(`   Provided OTP: ${otp}`);
    console.log(`   Current time: ${new Date()}`);
    if (!storedData) {
        console.log(`❌ No stored data for ${email}`);
        return { valid: false };
    }
    if (storedData.expiresAt < new Date()) {
        console.log(`❌ OTP expired for ${email}. Expired at: ${storedData.expiresAt}`);
        otpStorage.delete(email);
        return { valid: false };
    }
    if (storedData.otp !== otp) {
        console.log(`❌ OTP mismatch for ${email}. Expected: ${storedData.otp}, Got: ${otp}`);
        return { valid: false };
    }
    // OTP is valid, remove it from storage
    const purpose = storedData.purpose;
    console.log(`✅ OTP valid for ${email}. Purpose: ${purpose}`);
    otpStorage.delete(email);
    return { valid: true, purpose };
};
exports.verifyOTP = verifyOTP;
/**
 * Clean up expired OTPs
 */
const cleanupExpiredOTPs = () => {
    const now = new Date();
    for (const [email, data] of otpStorage.entries()) {
        if (data.expiresAt < now) {
            otpStorage.delete(email);
        }
    }
};
exports.cleanupExpiredOTPs = cleanupExpiredOTPs;
// Clean up expired OTPs every 5 minutes
setInterval(exports.cleanupExpiredOTPs, 5 * 60 * 1000);
