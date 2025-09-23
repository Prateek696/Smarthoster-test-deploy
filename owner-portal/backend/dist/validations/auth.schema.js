"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
const companySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Company name is required"),
    nif: zod_1.z.string().min(1, "NIF is required")
});
exports.signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    role: zod_1.z.string().refine((val) => ["admin", "owner", "accountant", "user"].includes(val), {
        message: "Role must be one of: admin, owner, accountant, user"
    }).optional(),
    companies: zod_1.z.array(companySchema).optional()
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1, "Password is required")
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email()
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    otp: zod_1.z.string().length(6, "OTP must be 6 digits"),
    newPassword: zod_1.z.string().min(6, "Password must be at least 6 characters")
});
exports.otpSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    otp: zod_1.z.string().length(6, "OTP must be 6 digits")
});
