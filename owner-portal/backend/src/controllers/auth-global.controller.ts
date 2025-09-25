import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import clientPromise from "../lib/mongodb";
import { loginSchema, otpSchema, signupSchema } from "../validations/auth.schema";
import { sendOTP, verifyOTP } from "../services/otp.service";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

/**
 * @desc Send OTP for login (using global MongoDB connection)
 * This is the NEW version that uses the global connection pattern
 */
export const sendLoginOTPGlobal = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 sendLoginOTPGlobal: Starting with global connection...');
    
    // Use global connection pattern
    const client = await clientPromise;
    const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
    const db = client.db(dbName);
    
    const parsed = loginSchema.parse(req.body);
    console.log(`📧 Looking for user: ${parsed.email}`);

    // Check if user exists using native MongoDB client
    const user = await db.collection('users').findOne({ email: parsed.email });
    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log(`✅ User found: ${user.name}`);

    // Verify password
    const isPasswordValid = await bcrypt.compare(parsed.password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log('✅ Password verified');

    // Send OTP
    const otpSent = await sendOTP(parsed.email, 'login');
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
  } catch (error: any) {
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

/**
 * @desc Send OTP for login (ORIGINAL mongoose version)
 * This is the OLD version for comparison
 */
export const sendLoginOTPOriginal = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 sendLoginOTPOriginal: Starting with mongoose connection...');
    
    // Import mongoose and ensure connection
    const mongoose = await import("mongoose");
    const { ensureDBConnection } = await import("../config/db");
    
    await ensureDBConnection();
    
    const parsed = loginSchema.parse(req.body);
    console.log(`📧 Looking for user: ${parsed.email}`);

    // Use mongoose model
    const { UserModel } = await import("../models/User.model");
    const user = await UserModel.findOne({ email: parsed.email });
    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log(`✅ User found: ${user.name}`);

    // Verify password
    const isPasswordValid = await bcrypt.compare(parsed.password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log('✅ Password verified');

    // Send OTP
    const otpSent = await sendOTP(parsed.email, 'login');
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
  } catch (error: any) {
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

/**
 * @desc Verify OTP and login (using global MongoDB connection)
 * This is the NEW version that uses the global connection pattern
 */
export const verifyLoginOTPGlobal = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 verifyLoginOTPGlobal: Starting with global connection...');
    
    // Use global connection pattern
    const client = await clientPromise;
    const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
    const db = client.db(dbName);
    
    const parsed = otpSchema.parse(req.body);
    console.log(`📧 Verifying OTP for: ${parsed.email}`);

    // Verify OTP
    const verification = verifyOTP(parsed.email, parsed.otp);
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
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

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
  } catch (error: any) {
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

/**
 * @desc Verify OTP and login (ORIGINAL mongoose version)
 * This is the OLD version for comparison
 */
export const verifyLoginOTPOriginal = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 verifyLoginOTPOriginal: Starting with mongoose connection...');
    
    // Import mongoose and ensure connection
    const mongoose = await import("mongoose");
    const { ensureDBConnection } = await import("../config/db");
    
    await ensureDBConnection();
    
    const parsed = otpSchema.parse(req.body);
    console.log(`📧 Verifying OTP for: ${parsed.email}`);

    // Verify OTP
    const verification = verifyOTP(parsed.email, parsed.otp);
    if (!verification.valid || verification.purpose !== 'login') {
      console.log('❌ Invalid or expired OTP');
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    console.log('✅ OTP verified');

    // Use mongoose model
    const { UserModel } = await import("../models/User.model");
    const user = await UserModel.findOne({ email: parsed.email });
    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ message: "User not found" });
    }

    console.log(`✅ User found: ${user.name}`);

    // Create token payload
    const payload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

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
  } catch (error: any) {
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
