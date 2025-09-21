import { Request, Response } from "express";
import { OTPModel } from "../models/OTP.model";
import { UserModel } from "../models/User.model";
import { transporter } from "../config/mailer";
import { generateOTP } from "../utils/otp";
import { requestOTPSchema, verifyOTPSchema, resetPasswordSchema } from "../validations/otp.schema";
import { showUsernameSchema } from "../validations/username.schema";
import bcrypt from "bcrypt";

const OTP_EXPIRATION_MINUTES = 10;

/**
 * @desc Verify OTP and return current username without changing it
 */
export const showUsername = async (req: Request, res: Response) => {
  try {
    const { email, code } = showUsernameSchema.parse(req.body);

    // Verify OTP (valid, unused, not expired)
    const otpEntry = await OTPModel.findOne({
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
    const user = await UserModel.findOne({ email }).select("name");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "OTP verified successfully",
      username: user.name,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.errors || error.message });
  }
};

export const requestOTP = async (req: Request, res: Response) => {
  try {
    const { email, purpose } = requestOTPSchema.parse(req.body);

    // Check user exists for password reset or username change
    if (purpose === "password-reset" || purpose === "username-change") {
      const user = await UserModel.findOne({ email });
      if (!user) return res.status(400).json({ message: "User not found" });
    }

    // Generate OTP
    const code = generateOTP();

    // Save OTP in DB
    await OTPModel.create({
      email,
      code,
      purpose,
      expiresAt: new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60000),
    });

    // Send OTP email
    await transporter.sendMail({
      from: `"Owner Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Your OTP Code for ${purpose.replace("-", " ")}`,
      text: `Your OTP code is ${code}. It will expire in ${OTP_EXPIRATION_MINUTES} minutes.`,
    });

    res.json({ message: "OTP sent to email" });
  } catch (error: any) {
    res.status(400).json({ message: error.errors || error.message });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, code, purpose } = verifyOTPSchema.parse(req.body);

    const otpEntry = await OTPModel.findOne({
      email,
      code,
      purpose,
      expiresAt: { $gt: new Date() },
      used: false,
    });

    if (!otpEntry) return res.status(400).json({ message: "Invalid or expired OTP" });

    // Mark OTP as used
    otpEntry.used = true;
    await otpEntry.save();

    res.json({ message: "OTP verified" });
  } catch (error: any) {
    res.status(400).json({ message: error.errors || error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = resetPasswordSchema.parse(req.body);

    // Check OTP is valid and not used
    const otpEntry = await OTPModel.findOne({
      email,
      code,
      purpose: "password-reset",
      expiresAt: { $gt: new Date() },
      used: false,
    });

    if (!otpEntry) return res.status(400).json({ message: "Invalid or expired OTP" });

    // Mark OTP used
    otpEntry.used = true;
    await otpEntry.save();

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update user password
    const user = await UserModel.findOneAndUpdate(
      { email },
      { password: hashed },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Password reset successful" });
  } catch (error: any) {
    res.status(400).json({ message: error.errors || error.message });
  }
};
