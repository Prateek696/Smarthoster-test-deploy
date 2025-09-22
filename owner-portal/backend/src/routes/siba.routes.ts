import { Router } from "express";
import { 
  getSibaStatus, 
  sendSiba, 
  validateSiba, 
  getBulkSibaStatus, 
  getSibaLogs,
  debugSibaApis 
} from "../controllers/siba.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOwnerOrAccountant, requireOwner } from "../middlewares/role.middleware";

const router = Router();

// SIBA status - accessible by owners and accountants
router.get("/:propertyId/siba-status", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  getSibaStatus
);

// Send SIBA for a specific reservation - owners only
router.post("/:propertyId/siba/send", 
  authMiddleware, 
  requireOwner, 
  sendSiba
);

// Validate SIBA data for a reservation - owners and accountants
router.get("/siba/validate/:reservationId", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  validateSiba
);

// Get bulk SIBA status for multiple properties - owners and accountants
router.post("/siba/bulk-status", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  getBulkSibaStatus
);

// Get SIBA logs for a reservation - owners and accountants
router.get("/siba/logs/:reservationId", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  getSibaLogs
);

// Debug endpoint to test API connections - owners and accountants
router.get("/:propertyId/siba/debug", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  debugSibaApis
);

export default router;
