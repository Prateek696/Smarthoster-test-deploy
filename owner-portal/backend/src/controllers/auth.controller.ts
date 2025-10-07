import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/User.model";
import { signupSchema, loginSchema, otpSchema, forgotPasswordSchema, resetPasswordSchema } from "../validations/auth.schema";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { sendOTP, verifyOTP } from "../services/otp.service";
import { ensureDBConnection } from "../config/db";

/**
 * @desc Send OTP for login (after password verification)
 */
export const sendLoginOTP = async (req: Request, res: Response) => {
  try {
    // Ensure database connection before proceeding
    await ensureDBConnection();
    
    const parsed = loginSchema.parse(req.body);

    // Check if user exists
    const user = await UserModel.findOne({ email: parsed.email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(parsed.password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Send OTP
    const otpSent = await sendOTP(parsed.email, 'login');
    if (!otpSent) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    res.json({ message: "OTP sent to your email" });
  } catch (error: any) {
    res.status(400).json({ message: error.errors || error.message });
  }
};

/**
 * @desc Send OTP for signup
 */
export const sendSignupOTP = async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.parse(req.body);

    // Check if email already exists
    const existing = await UserModel.findOne({ email: parsed.email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check if trying to signup as admin and admin already exists
    if (parsed.role === 'admin') {
      const adminExists = await UserModel.findOne({ role: 'admin' });
      if (adminExists) {
        return res.status(400).json({ message: "Admin account already exists. Only one admin is allowed." });
      }
    }

    // Send OTP
    const otpSent = await sendOTP(parsed.email, 'signup');
    if (!otpSent) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    res.json({ message: "OTP sent to your email" });
  } catch (error: any) {
    res.status(400).json({ message: error.errors || error.message });
  }
};

/**
 * @desc Verify OTP and login
 */
export const verifyLoginOTP = async (req: Request, res: Response) => {
  try {
    const parsed = otpSchema.parse(req.body);

    // Verify OTP
    const verification = verifyOTP(parsed.email, parsed.otp);
    if (!verification) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Find user
    const user = await UserModel.findOne({ email: parsed.email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Create token payload
    const payload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({ accessToken, refreshToken, user });
  } catch (error: any) {
    res.status(400).json({ message: error.errors || error.message });
  }
};

/**
 * @desc Verify OTP and create account
 */
export const verifySignupOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp, name, phone, password, role } = req.body;

    // Verify OTP
    const verification = verifyOTP(email, otp);
    if (!verification) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if email already exists
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check if trying to signup as admin and admin already exists
    if (role === 'admin') {
      const adminExists = await UserModel.findOne({ role: 'admin' });
      if (adminExists) {
        return res.status(400).json({ message: "Admin account already exists. Only one admin is allowed." });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await UserModel.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || 'user',
      isVerified: true,
    });

    // Create token payload
    const payload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(201).json({ accessToken, refreshToken, user });
  } catch (error: any) {
    res.status(400).json({ message: error.errors || error.message });
  }
};

/**
 * @desc Get current user from DB (Protected route)
 */
export const me = async (req: any, res: Response) => {
  try {
    // fetch user by id from JWT payload
    const user = await UserModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Send OTP for forgot password
 */
export const sendForgotPasswordOTP = async (req: Request, res: Response) => {
  try {
    const parsed = forgotPasswordSchema.parse(req.body);

    // Check if user exists
    const user = await UserModel.findOne({ email: parsed.email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Send OTP
    const otpSent = await sendOTP(parsed.email, 'forgot-password');
    if (!otpSent) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    res.json({ message: "OTP sent to your email" });
  } catch (error: any) {
    res.status(400).json({ message: error.errors || error.message });
  }
};

/**
 * @desc Reset password with OTP verification
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const parsed = resetPasswordSchema.parse(req.body);

    // Verify OTP
    const verification = verifyOTP(parsed.email, parsed.otp);
    if (!verification) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if user exists
    const user = await UserModel.findOne({ email: parsed.email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(parsed.newPassword, 12);

    // Update password
    await UserModel.findByIdAndUpdate(user._id, { password: hashedPassword });

    res.json({ message: "Password reset successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.errors || error.message });
  }
};
