import { z } from "zod";

export const requestOTPSchema = z.object({
  email: z.string().email(),
  purpose: z.union([z.literal("password-reset"), z.literal("username-change")]),
});

export const verifyOTPSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  purpose: z.union([z.literal("password-reset"), z.literal("username-change")]),
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