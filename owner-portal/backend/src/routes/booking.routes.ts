import { Router } from "express";
import { getBookings, getBookingDetail, getBookingsDebug, debugPropertyApiKeys, listHostawayProperties } from "../controllers/booking.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOwnerOrAccountant } from "../middlewares/role.middleware";

const router = Router();

// GET /bookings/:listingId - accessible by owners and accountants
router.get("/:listingId", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  getBookings
);

// GET /bookings/detail/:bookingId - get individual booking details
router.get("/detail/:bookingId", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  getBookingDetail
);

// GET /bookings/:listingId/debug - debug endpoint to examine raw API data
router.get("/:listingId/debug", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  getBookingsDebug
);

// GET /bookings/debug/property/:propertyId - debug API keys for specific property
router.get("/debug/property/:propertyId", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  debugPropertyApiKeys
);

// GET /bookings/debug/hostaway/properties - list all available properties in Hostaway
router.get("/debug/hostaway/properties", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  listHostawayProperties
);

export default router;
