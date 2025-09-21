import { Router } from "express";
import { getPerformance } from "../controllers/performance.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOwnerOrAccountant } from "../middlewares/role.middleware";

const router = Router();

// GET /performance/:listingId?month=YYYY-MM - accessible by owners and accountants
router.get("/:listingId", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  getPerformance
);

export default router;
