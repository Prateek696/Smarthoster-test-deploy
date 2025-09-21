"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const calendar_controller_1 = require("../controllers/calendar.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Calendar endpoints
router.get("/:listingId", auth_middleware_1.authMiddleware, calendar_controller_1.getCalendar);
// Get specific date data with pricing and minimum nights
router.get("/:listingId/date/:date", auth_middleware_1.authMiddleware, calendar_controller_1.getCalendarDate);
// Get monthly pricing data for calendar display
router.get("/:listingId/month/:year/:month", auth_middleware_1.authMiddleware, calendar_controller_1.getCalendarMonthPricing);
// Only owners can update calendar (block/unblock dates)
router.put("/:listingId", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, calendar_controller_1.updateCalendar);
// Update pricing for specific dates
router.put("/:listingId/pricing", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, calendar_controller_1.updateCalendarPricing);
// Update minimum stay for specific dates
router.put("/:listingId/minimum-stay", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, calendar_controller_1.updateCalendarMinimumStay);
// Block/Unblock dates via Hostaway API
router.put("/", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, calendar_controller_1.updateCalendarAvailability);
// Bookings endpoint (both owners and accountants can view)
router.get("/:listingId/bookings", auth_middleware_1.authMiddleware, calendar_controller_1.getBookings);
exports.default = router;
