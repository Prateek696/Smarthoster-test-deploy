import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().refine((val) => ["admin", "owner", "accountant", "user"].includes(val), {
    message: "Role must be one of: admin, owner, accountant, user"
  }).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required")
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters")
});

export const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits")
});
