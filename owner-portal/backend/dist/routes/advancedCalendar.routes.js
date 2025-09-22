"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const advancedCalendar_controller_1 = require("../controllers/advancedCalendar.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Advanced calendar endpoints
router.get("/events", auth_middleware_1.authMiddleware, advancedCalendar_controller_1.getAdvancedCalendarEvents);
router.post("/events", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, advancedCalendar_controller_1.createAdvancedCalendarEvent);
router.put("/events/:eventId", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, advancedCalendar_controller_1.updateAdvancedCalendarEvent);
router.delete("/events/:eventId", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, advancedCalendar_controller_1.deleteAdvancedCalendarEvent);
// Bulk operations
router.get("/bulk-operations", auth_middleware_1.authMiddleware, advancedCalendar_controller_1.getBulkOperations);
router.post("/bulk-operations", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, advancedCalendar_controller_1.createBulkOperation);
exports.default = router;
