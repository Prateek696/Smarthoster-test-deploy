import * as nodemailer from 'nodemailer';
import crypto from 'crypto';

interface OTPData {
  email: string;
  otp: string;
  expiresAt: Date;
  purpose: 'login' | 'signup' | 'forgot-password';
}

// In-memory storage for OTPs (in production, use Redis)
const otpStorage = new Map<string, OTPData>();

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
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send OTP via email
 */
export const sendOTP = async (email: string, purpose: 'login' | 'signup' | 'forgot-password'): Promise<boolean> => {
  try {
    const otp = generateOTP();
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
              : 'Use the following OTP to reset your password:'
            }
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
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    return false;
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = (email: string, otp: string): { valid: boolean; purpose?: string } => {
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

/**
 * Clean up expired OTPs
 */
export const cleanupExpiredOTPs = (): void => {
  const now = new Date();
  for (const [email, data] of otpStorage.entries()) {
    if (data.expiresAt < now) {
      otpStorage.delete(email);
    }
  }
};

// Clean up expired OTPs every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);
