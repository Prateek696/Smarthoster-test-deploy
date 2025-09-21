"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const siba_controller_1 = require("../controllers/siba.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// SIBA status - accessible by owners and accountants
router.get("/:propertyId/siba-status", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, siba_controller_1.getSibaStatus);
// Send SIBA for a specific reservation - owners only
router.post("/:propertyId/siba/send", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, siba_controller_1.sendSiba);
// Validate SIBA data for a reservation - owners and accountants
router.get("/siba/validate/:reservationId", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, siba_controller_1.validateSiba);
// Get bulk SIBA status for multiple properties - owners and accountants
router.post("/siba/bulk-status", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, siba_controller_1.getBulkSibaStatus);
// Get SIBA logs for a reservation - owners and accountants
router.get("/siba/logs/:reservationId", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, siba_controller_1.getSibaLogs);
// Debug endpoint to test API connections - owners and accountants
router.get("/:propertyId/siba/debug", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, siba_controller_1.debugSibaApis);
exports.default = router;
