"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public route to check if admin exists (no auth required)
router.get('/check-admin-exists', admin_controller_1.checkAdminExists);
// Public route to create first admin (one-time only)
router.post('/create-first-admin', admin_controller_1.createFirstAdmin);
// Public route to check admin setup status
router.get('/check-setup', admin_controller_1.checkAdminSetup);
// Apply auth middleware to all routes
router.use(auth_middleware_1.authMiddleware);
// Admin dashboard stats
router.get('/dashboard/stats', admin_middleware_1.requireAdmin, admin_controller_1.getAdminDashboardStats);
// Owner management routes
router.get('/owners', admin_middleware_1.requireAdmin, admin_controller_1.getAllOwners);
router.post('/owners', admin_middleware_1.requireAdmin, admin_controller_1.createOwner);
router.put('/owners/:ownerId', admin_middleware_1.requireAdmin, admin_controller_1.updateOwner);
router.delete('/owners/:ownerId', admin_middleware_1.requireAdmin, admin_controller_1.deleteOwner);
// Accountant management routes
router.get('/accountants', admin_middleware_1.requireAdmin, admin_controller_1.getAllAccountants);
router.put('/accountants/:accountantId', admin_middleware_1.requireAdmin, admin_controller_1.updateAccountant);
router.put('/accountants/:accountantId/properties', admin_middleware_1.requireAdmin, admin_controller_1.updateAccountantProperties);
router.delete('/accountants/:accountantId', admin_middleware_1.requireAdmin, admin_controller_1.deleteAccountant);
// Property management routes
router.get('/properties', admin_middleware_1.requireAdmin, admin_controller_1.getAllProperties);
router.post('/properties', admin_middleware_1.requireAdmin, admin_controller_1.createProperty);
router.delete('/properties/:propertyId', admin_middleware_1.requireAdmin, admin_controller_1.deleteProperty);
router.post('/owners/:ownerId/assign-property', admin_middleware_1.requireAdmin, admin_controller_1.assignPropertyToOwner);
// Owner statement routes
router.get('/properties/:propertyId/owner-statement', admin_middleware_1.requireAdmin, admin_controller_1.generateOwnerStatement);
// API key management routes
router.get('/owners/:ownerId/api-keys', admin_middleware_1.requireAdmin, admin_controller_1.getOwnerApiKeys);
router.put('/owners/:ownerId/api-keys', admin_middleware_1.requireAdmin, admin_controller_1.updateOwnerApiKeys);
exports.default = router;
