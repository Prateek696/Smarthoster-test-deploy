"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const property_controller_1 = require("../controllers/property.controller");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
// Property CRUD routes
router.post("/", property_controller_1.createProperty);
router.get("/", property_controller_1.getProperties);
router.get("/:propertyId", property_controller_1.getPropertyById);
router.put("/:propertyId", property_controller_1.updateProperty);
router.delete("/:propertyId", property_controller_1.deleteProperty);
// Utility routes
router.post("/test-hostkit", property_controller_1.testHostkitConnection);
router.get("/dashboard/metrics", property_controller_1.getDashboardMetrics);
exports.default = router;
