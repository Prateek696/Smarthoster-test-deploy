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
          <img src="data:image/jpeg;base64,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" alt="SmartHoster Logo" style="width: 60px; height: 60px; margin-bottom: 15px; border-radius: 8px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SmartHoster Portal</h1>
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
