"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Password + OTP-based authentication routes
router.post("/send-login-otp", auth_controller_1.sendLoginOTP);
router.post("/verify-login-otp", auth_controller_1.verifyLoginOTP);
router.post("/send-signup-otp", auth_controller_1.sendSignupOTP);
router.post("/verify-signup-otp", auth_controller_1.verifySignupOTP);
router.post("/forgot-password", auth_controller_1.sendForgotPasswordOTP);
router.post("/reset-password", auth_controller_1.resetPassword);
router.get("/me", auth_middleware_1.authMiddleware, auth_controller_1.me);
exports.default = router;
