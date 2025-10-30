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
        const portalUrl = process.env.PORTAL_URL || 'https://smarthoster-test-deploy-final.vercel.app';
        // Email content
        const subject = purpose === 'login' ? 'Login OTP' : purpose === 'signup' ? 'Account Verification OTP' : 'Password Reset OTP';
        const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>SmartHoster OTP Verification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ecfeff;">
        <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#ecfeff" style="background-color: #ecfeff; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.06); overflow: hidden;">
                        
                        <!-- Header with Logo -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #34d399 0%, #38bdf8 100%); padding: 40px 30px; text-align: center;">
                                <img src="https://res.cloudinary.com/dd5notzuv/image/upload/c_fill,w_80,h_80,b_white/v1761401047/Real-logo_aaqxgq.jpg" alt="SmartHoster Logo" style="width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 12px; padding: 5px;" />
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                    SmartHoster Portal
                                </h1>
                                <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 1;">
                                    ${purpose === 'login' ? 'Secure Login Verification' : purpose === 'signup' ? 'Account Verification' : 'Password Reset'}
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="padding: 40px 30px; background-color: #ffffff;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">
                                        ${purpose === 'login' ? 'Login Verification Code' : purpose === 'signup' ? 'Account Verification Code' : 'Password Reset Code'}
                                    </h2>
                                    <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">
            ${purpose === 'login'
            ? 'Use the following verification code to complete your login process:'
            : purpose === 'signup'
                ? 'Use the following verification code to complete your account setup:'
                : 'Use the following verification code to reset your password:'}
          </p>
                                </div>
                                
                                <!-- OTP Code Box -->
                                <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                                    <div style="background: #ffffff; border: 2px dashed #22c55e; border-radius: 8px; padding: 25px; margin: 0 auto; max-width: 300px;">
                                        <span style="font-size: 36px; font-weight: bold; color: #16a34a; letter-spacing: 6px; font-family: 'Courier New', monospace;">${otp}</span>
                                    </div>
          </div>
          
                                <!-- Security Notice -->
                                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 8px; margin: 25px 0;">
                                    <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
                                        ⚠️ <strong>Security Notice:</strong> This code is valid for 10 minutes only. Never share this code with anyone.
          </p>
        </div>
        
                                <!-- Additional Info -->
                                <div style="text-align: center; margin-top: 30px;">
                                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                                        If you didn't request this ${purpose === 'login' ? 'login' : purpose === 'signup' ? 'verification' : 'password reset'}, 
                                        please ignore this email or contact our support team.
                                    </p>
        </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background: #f0fdf4; padding: 30px; text-align: center; border-top: 1px solid #bbf7d0;">
                                <p style="color: #065f46; font-size: 12px; margin: 0 0 10px 0;">
                                    © 2024 SmartHoster. All rights reserved.
                                </p>
                                <p style="color: #0369a1; font-size: 12px; margin: 0;">
                                    This is an automated message. Please do not reply to this email.
                                </p>
                            </td>
                        </tr>
                        
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
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
    const otpData = otpStorage.get(email);
    if (!otpData) {
        console.log(`❌ No OTP found for ${email}`);
        return false;
    }
    // Check if OTP has expired
    if (new Date() > otpData.expiresAt) {
        console.log(`❌ OTP expired for ${email}`);
        otpStorage.delete(email);
        return false;
    }
    // Verify OTP
    if (otpData.otp !== otp) {
        console.log(`❌ Invalid OTP for ${email}. Expected: ${otpData.otp}, Got: ${otp}`);
        return false;
    }
    // OTP verified successfully
    console.log(`✅ OTP verified successfully for ${email}`);
    otpStorage.delete(email);
    return true;
};
exports.verifyOTP = verifyOTP;
/**
 * Clean up expired OTPs (run periodically)
 */
const cleanupExpiredOTPs = () => {
    const now = new Date();
    for (const [email, otpData] of otpStorage.entries()) {
        if (now > otpData.expiresAt) {
            otpStorage.delete(email);
            console.log(`🧹 Cleaned up expired OTP for ${email}`);
        }
    }
};
exports.cleanupExpiredOTPs = cleanupExpiredOTPs;
