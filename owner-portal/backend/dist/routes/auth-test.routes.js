"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_global_controller_1 = require("../controllers/auth-global.controller");
const auth_signup_global_controller_1 = require("../controllers/auth-signup-global.controller");
const router = (0, express_1.Router)();
// Test routes using NEW global connection pattern
router.post("/send-login-otp-global", auth_global_controller_1.sendLoginOTPGlobal);
router.post("/verify-login-otp-global", auth_global_controller_1.verifyLoginOTPGlobal);
router.post("/send-signup-otp-global", auth_signup_global_controller_1.sendSignupOTPGlobal);
router.post("/verify-signup-otp-global", auth_signup_global_controller_1.verifySignupOTPGlobal);
// Test routes using OLD mongoose pattern for comparison
router.post("/send-login-otp-original", auth_global_controller_1.sendLoginOTPOriginal);
router.post("/verify-login-otp-original", auth_global_controller_1.verifyLoginOTPOriginal);
router.post("/send-signup-otp-original", auth_signup_global_controller_1.sendSignupOTPOriginal);
router.post("/verify-signup-otp-original", auth_signup_global_controller_1.verifySignupOTPOriginal);
exports.default = router;
