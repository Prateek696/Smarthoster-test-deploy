import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import clientPromise from "../lib/mongodb";
import { signupSchema } from "../validations/auth.schema";
import { sendOTP, verifyOTP } from "../services/otp.service";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

/**
 * @desc Send OTP for signup (using global MongoDB connection)
 * This is the NEW version that uses the global connection pattern
 */
export const sendSignupOTPGlobal = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 sendSignupOTPGlobal: Starting with global connection...');
    
    // Use global connection pattern
    const client = await clientPromise;
    const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
    const db = client.db(dbName);
    
    const parsed = signupSchema.parse(req.body);
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
    const otpSent = await sendOTP(parsed.email, 'signup');
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
  } catch (error: any) {
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

/**
 * @desc Send OTP for signup (ORIGINAL mongoose version)
 * This is the OLD version for comparison
 */
export const sendSignupOTPOriginal = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 sendSignupOTPOriginal: Starting with mongoose connection...');
    
    // Import mongoose and ensure connection
    const mongoose = await import("mongoose");
    const { ensureDBConnection } = await import("../config/db");
    
    await ensureDBConnection();
    
    const parsed = signupSchema.parse(req.body);
    console.log(`📧 Checking signup for: ${parsed.email}`);

    // Use mongoose model
    const { UserModel } = await import("../models/User.model");
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
    const otpSent = await sendOTP(parsed.email, 'signup');
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
  } catch (error: any) {
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

/**
 * @desc Verify OTP and create account (using global MongoDB connection)
 * This is the NEW version that uses the global connection pattern
 */
export const verifySignupOTPGlobal = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 verifySignupOTPGlobal: Starting with global connection...');
    
    // Use global connection pattern
    const client = await clientPromise;
    const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
    const db = client.db(dbName);
    
    const { email, otp, name, phone, password, role } = req.body;
    console.log(`📧 Verifying signup OTP for: ${email}`);

    // Verify OTP
    const verification = verifyOTP(email, otp);
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
    const hashedPassword = await bcrypt.hash(password, 12);
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
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

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
  } catch (error: any) {
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

/**
 * @desc Verify OTP and create account (ORIGINAL mongoose version)
 * This is the OLD version for comparison
 */
export const verifySignupOTPOriginal = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 verifySignupOTPOriginal: Starting with mongoose connection...');
    
    // Import mongoose and ensure connection
    const mongoose = await import("mongoose");
    const { ensureDBConnection } = await import("../config/db");
    
    await ensureDBConnection();
    
    const { email, otp, name, phone, password, role } = req.body;
    console.log(`📧 Verifying signup OTP for: ${email}`);

    // Verify OTP
    const verification = verifyOTP(email, otp);
    if (!verification.valid || verification.purpose !== 'signup') {
      console.log('❌ Invalid or expired OTP');
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    console.log('✅ OTP verified');

    // Use mongoose model
    const { UserModel } = await import("../models/User.model");
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
    const hashedPassword = await bcrypt.hash(password, 12);
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
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

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
  } catch (error: any) {
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
