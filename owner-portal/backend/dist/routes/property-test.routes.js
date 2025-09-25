"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const property_global_controller_1 = require("../controllers/property-global.controller");
const property_update_global_controller_1 = require("../controllers/property-update-global.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Test routes using NEW global connection pattern
router.get("/properties-global", auth_middleware_1.authMiddleware, property_global_controller_1.getPropertiesGlobal);
router.get("/dashboard/metrics-global", auth_middleware_1.authMiddleware, property_global_controller_1.getDashboardMetricsGlobal);
router.put("/update-global/:propertyId", auth_middleware_1.authMiddleware, property_update_global_controller_1.updatePropertyGlobal);
// Test routes using OLD mongoose pattern for comparison
router.get("/properties-original", auth_middleware_1.authMiddleware, property_global_controller_1.getPropertiesOriginal);
router.get("/dashboard/metrics-original", auth_middleware_1.authMiddleware, property_global_controller_1.getDashboardMetricsOriginal);
router.put("/update-original/:propertyId", auth_middleware_1.authMiddleware, property_update_global_controller_1.updatePropertyOriginal);
exports.default = router;
