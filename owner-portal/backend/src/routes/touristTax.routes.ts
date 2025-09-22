import { Router } from "express";
import { getCityTax, getAllPropertiesCityTax, getTouristTaxDetailed, debugTouristTax } from "../controllers/touristTax.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOwnerOrAccountant } from "../middlewares/role.middleware";

const router = Router();

// City tax endpoints - accessible by owners and accountants
router.get("/city-tax/dashboard", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  getAllPropertiesCityTax
);

router.get("/:propertyId/city-tax", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  getCityTax
);

router.get("/:propertyId/tourist-tax/detailed", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  getTouristTaxDetailed
);

// Debug endpoint for tourist tax
router.get("/:propertyId/tourist-tax/debug", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  debugTouristTax
);

export default router;
