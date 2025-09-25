import { Router } from "express";
import { 
  getPropertiesGlobal,
  getPropertiesOriginal,
  getDashboardMetricsGlobal,
  getDashboardMetricsOriginal
} from "../controllers/property-global.controller";
import {
  updatePropertyGlobal,
  updatePropertyOriginal
} from "../controllers/property-update-global.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Test routes using NEW global connection pattern
router.get("/properties-global", authMiddleware, getPropertiesGlobal);
router.get("/dashboard/metrics-global", authMiddleware, getDashboardMetricsGlobal);
router.put("/update-global/:propertyId", authMiddleware, updatePropertyGlobal);

// Test routes using OLD mongoose pattern for comparison
router.get("/properties-original", authMiddleware, getPropertiesOriginal);
router.get("/dashboard/metrics-original", authMiddleware, getDashboardMetricsOriginal);
router.put("/update-original/:propertyId", authMiddleware, updatePropertyOriginal);

export default router;
