"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const propertyManagement_controller_1 = require("../controllers/propertyManagement.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Get properties for authenticated user
router.get("/", auth_middleware_1.authMiddleware, propertyManagement_controller_1.getProperties);
// Get dashboard metrics
router.get("/dashboard/metrics", auth_middleware_1.authMiddleware, propertyManagement_controller_1.getDashboardMetrics);
// Update property - owners and admins can update
router.put("/:propertyId", auth_middleware_1.authMiddleware, (0, role_middleware_1.requireRole)(['owner', 'admin']), propertyManagement_controller_1.updateProperty);
// Update property (POST method for frontend compatibility) - owners and admins
router.post("/:propertyId", auth_middleware_1.authMiddleware, (0, role_middleware_1.requireRole)(['owner', 'admin']), propertyManagement_controller_1.updateProperty);
// Update property (POST method without property ID in URL - for frontend compatibility) - owners and admins
router.post("/", auth_middleware_1.authMiddleware, (0, role_middleware_1.requireRole)(['owner', 'admin']), (req, res) => {
    // Extract property ID from request body
    const { propertyId, ...updateData } = req.body;
    if (!propertyId) {
        return res.status(400).json({ message: "Property ID is required in request body" });
    }
    // Add property ID to params and call updateProperty
    req.params.propertyId = propertyId.toString();
    (0, propertyManagement_controller_1.updateProperty)(req, res);
});
exports.default = router;
