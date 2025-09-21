import { Router } from "express";
import { getProperty } from "../controllers/hostkitProperty.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOwnerOrAccountant } from "../middlewares/role.middleware";
import { USER_ROLES } from "../constants/roles";

const router = Router();

// Property retrieval - accessible by owners and accountants
router.get("/properties/:propertyId", 
  authMiddleware,
  requireOwnerOrAccountant,
  getProperty
);

export default router;



