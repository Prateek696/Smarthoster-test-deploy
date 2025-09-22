import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  getNotificationSettings,
  updateNotificationSettings,
  getSecuritySettings,
  updateSecuritySettings
} from "../controllers/settings.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Profile routes
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

// Notification settings routes
router.get("/notifications", authMiddleware, getNotificationSettings);
router.put("/notifications", authMiddleware, updateNotificationSettings);

// Security settings routes
router.get("/security", authMiddleware, getSecuritySettings);
router.put("/security", authMiddleware, updateSecuritySettings);

export default router;

