"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const imageUpload_controller_1 = require("../controllers/imageUpload.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Upload images for a property - owners and admins can upload
router.post("/:propertyId", auth_middleware_1.authMiddleware, (0, role_middleware_1.requireRole)(['owner', 'admin']), (req, res, next) => {
    console.log('🔍 Image upload route hit:', req.params.propertyId);
    next();
}, imageUpload_controller_1.debugMulter, imageUpload_controller_1.uploadPropertyImages, imageUpload_controller_1.handleImageUpload);
// Delete a specific image from a property - owners and admins can delete
router.delete("/:propertyId/:imageUrl", auth_middleware_1.authMiddleware, (0, role_middleware_1.requireRole)(['owner', 'admin']), imageUpload_controller_1.deletePropertyImage);
exports.default = router;
