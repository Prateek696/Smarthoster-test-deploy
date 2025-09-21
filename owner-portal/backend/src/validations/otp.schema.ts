import { z } from "zod";

export const requestOTPSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(["password-reset", "username-change"] as const),
});

export const verifyOTPSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  purpose: z.enum(["password-reset", "username-change"] as const),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(6),
});

export const showUsernameSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});