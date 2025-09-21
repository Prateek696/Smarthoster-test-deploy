import { Router } from "express";
import { 
  sendLoginOTP, 
  sendSignupOTP, 
  verifyLoginOTP, 
  verifySignupOTP, 
  sendForgotPasswordOTP,
  resetPassword,
  me 
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Password + OTP-based authentication routes
router.post("/send-login-otp", sendLoginOTP);
router.post("/verify-login-otp", verifyLoginOTP);
router.post("/send-signup-otp", sendSignupOTP);
router.post("/verify-signup-otp", verifySignupOTP);
router.post("/forgot-password", sendForgotPasswordOTP);
router.post("/reset-password", resetPassword);
router.get("/me", authMiddleware, me);

export default router;
