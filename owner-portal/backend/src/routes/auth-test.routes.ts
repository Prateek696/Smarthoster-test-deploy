import { Router } from "express";
import { 
  sendLoginOTPGlobal, 
  sendLoginOTPOriginal,
  verifyLoginOTPGlobal,
  verifyLoginOTPOriginal
} from "../controllers/auth-global.controller";
import {
  sendSignupOTPGlobal,
  sendSignupOTPOriginal,
  verifySignupOTPGlobal,
  verifySignupOTPOriginal
} from "../controllers/auth-signup-global.controller";

const router = Router();

// Test routes using NEW global connection pattern
router.post("/send-login-otp-global", sendLoginOTPGlobal);
router.post("/verify-login-otp-global", verifyLoginOTPGlobal);
router.post("/send-signup-otp-global", sendSignupOTPGlobal);
router.post("/verify-signup-otp-global", verifySignupOTPGlobal);

// Test routes using OLD mongoose pattern for comparison
router.post("/send-login-otp-original", sendLoginOTPOriginal);
router.post("/verify-login-otp-original", verifyLoginOTPOriginal);
router.post("/send-signup-otp-original", sendSignupOTPOriginal);
router.post("/verify-signup-otp-original", verifySignupOTPOriginal);

export default router;
