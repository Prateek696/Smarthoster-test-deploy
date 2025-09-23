import { Router } from "express";
import { getSaft } from "../controllers/saft.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOwnerOrAccountant } from "../middlewares/role.middleware";

const router = Router();

// SAFT retrieval - accessible by owners and accountants
router.get("/get", 
  authMiddleware,
  requireOwnerOrAccountant,
  getSaft
);

export default router;
