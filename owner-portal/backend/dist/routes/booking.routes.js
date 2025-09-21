"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// GET /bookings/:listingId - accessible by owners and accountants
router.get("/:listingId", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, booking_controller_1.getBookings);
// GET /bookings/detail/:bookingId - get individual booking details
router.get("/detail/:bookingId", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, booking_controller_1.getBookingDetail);
// GET /bookings/:listingId/debug - debug endpoint to examine raw API data
router.get("/:listingId/debug", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, booking_controller_1.getBookingsDebug);
// GET /bookings/debug/property/:propertyId - debug API keys for specific property
router.get("/debug/property/:propertyId", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, booking_controller_1.debugPropertyApiKeys);
// GET /bookings/debug/hostaway/properties - list all available properties in Hostaway
router.get("/debug/hostaway/properties", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, booking_controller_1.listHostawayProperties);
exports.default = router;
