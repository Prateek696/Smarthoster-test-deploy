import { Router } from "express";
import { 
  getCurrentUserGlobal,
  getCurrentUserOriginal,
  updateUserProfileGlobal,
  updateUserProfileOriginal
} from "../controllers/user-profile-global.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Test routes using NEW global connection pattern
router.get("/current-user-global", authMiddleware, getCurrentUserGlobal);
router.put("/update-profile-global", authMiddleware, updateUserProfileGlobal);

// Test routes using OLD mongoose pattern for comparison
router.get("/current-user-original", authMiddleware, getCurrentUserOriginal);
router.put("/update-profile-original", authMiddleware, updateUserProfileOriginal);

export default router;
