import { Router } from "express";
import { requestOTP, verifyOTP, resetPassword } from "../controllers/otp.controller";
import { showUsername } from "../controllers/otp.controller";
const router = Router();

router.post("/request", requestOTP);
router.post("/verify", verifyOTP);
router.post("/reset-password", resetPassword);
router.post("/show-username", showUsername);
export default router;
