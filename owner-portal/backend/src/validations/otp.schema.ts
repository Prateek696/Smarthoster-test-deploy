import { z } from "zod";

export const requestOTPSchema = z.object({
  email: z.string().email(),
  purpose: z.string().refine((val) => val === "password-reset" || val === "username-change", {
    message: "Purpose must be either 'password-reset' or 'username-change'"
  }),
});

export const verifyOTPSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  purpose: z.string().refine((val) => val === "password-reset" || val === "username-change", {
    message: "Purpose must be either 'password-reset' or 'username-change'"
  }),
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