import { Router } from "express";
import {
  getCalendar,
  updateCalendar,
  getBookings,
  getCalendarDate,
  updateCalendarPricing,
  updateCalendarMinimumStay,
  getCalendarMonthPricing,
  updateCalendarAvailability,
} from "../controllers/calendar.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOwner } from "../middlewares/role.middleware";

const router = Router();

// Calendar endpoints
router.get("/:listingId", authMiddleware, getCalendar);
// Get specific date data with pricing and minimum nights
router.get("/:listingId/date/:date", authMiddleware, getCalendarDate);
// Get monthly pricing data for calendar display
router.get("/:listingId/month/:year/:month", authMiddleware, getCalendarMonthPricing);
// Only owners can update calendar (block/unblock dates)
router.put("/:listingId", authMiddleware, requireOwner, updateCalendar);
// Update pricing for specific dates
router.put("/:listingId/pricing", authMiddleware, requireOwner, updateCalendarPricing);
// Update minimum stay for specific dates
router.put("/:listingId/minimum-stay", authMiddleware, requireOwner, updateCalendarMinimumStay);

// Block/Unblock dates via Hostaway API
router.put("/", authMiddleware, requireOwner, updateCalendarAvailability);

// Bookings endpoint (both owners and accountants can view)
router.get("/:listingId/bookings", authMiddleware, getBookings);

export default router;
