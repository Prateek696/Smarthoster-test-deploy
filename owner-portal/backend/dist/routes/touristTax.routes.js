"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const touristTax_controller_1 = require("../controllers/touristTax.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// City tax endpoints - accessible by owners and accountants
router.get("/city-tax/dashboard", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, touristTax_controller_1.getAllPropertiesCityTax);
router.get("/:propertyId/city-tax", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, touristTax_controller_1.getCityTax);
router.get("/:propertyId/tourist-tax/detailed", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, touristTax_controller_1.getTouristTaxDetailed);
// Debug endpoint for tourist tax
router.get("/:propertyId/tourist-tax/debug", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, touristTax_controller_1.debugTouristTax);
exports.default = router;
