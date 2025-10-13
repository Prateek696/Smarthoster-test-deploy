import { Router } from "express";
import { getProperties, updateProperty, getDashboardMetrics, fetchHostawayPropertyDetails, testHostkitConnection } from "../controllers/propertyManagement.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOwner, requireOwnerOrAccountant, requireRole } from "../middlewares/role.middleware";

const router = Router();

// Get properties for authenticated user
router.get("/", authMiddleware, getProperties);

// Get dashboard metrics
router.get("/dashboard/metrics", authMiddleware, getDashboardMetrics);

// Secure test Hostkit connection (no API keys exposed)
router.post("/test-hostkit", 
  authMiddleware, 
  requireRole(['owner', 'admin']), 
  testHostkitConnection
);

// Fetch property details from Hostaway by listing ID
router.get("/fetch-hostaway/:hostawayListingId", 
  authMiddleware, 
  requireRole(['owner', 'admin']), 
  fetchHostawayPropertyDetails
);

// Update property - owners and admins can update
router.put("/:propertyId", 
  authMiddleware, 
  requireRole(['owner', 'admin']), 
  updateProperty
);

// Update property (POST method for frontend compatibility) - owners and admins
router.post("/:propertyId", 
  authMiddleware, 
  requireRole(['owner', 'admin']), 
  updateProperty
);

// Update property (POST method without property ID in URL - for frontend compatibility) - owners and admins
router.post("/", 
  authMiddleware, 
  requireRole(['owner', 'admin']), 
  (req: any, res: any) => {
    // Extract property ID from request body
    const { propertyId, ...updateData } = req.body;
    
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required in request body" });
    }
    
    // Add property ID to params and call updateProperty
    req.params.propertyId = propertyId.toString();
    updateProperty(req, res);
  }
);

export default router;
