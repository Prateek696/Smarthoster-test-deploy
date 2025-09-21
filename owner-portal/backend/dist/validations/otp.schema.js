"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showUsernameSchema = exports.resetPasswordSchema = exports.verifyOTPSchema = exports.requestOTPSchema = void 0;
const zod_1 = require("zod");
exports.requestOTPSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    purpose: zod_1.z.string().refine((val) => val === "password-reset" || val === "username-change", {
        message: "Purpose must be either 'password-reset' or 'username-change'"
    }),
});
exports.verifyOTPSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().length(6),
    purpose: zod_1.z.string().refine((val) => val === "password-reset" || val === "username-change", {
        message: "Purpose must be either 'password-reset' or 'username-change'"
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().length(6),
    newPassword: zod_1.z.string().min(6),
});
exports.showUsernameSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().length(6),
});
