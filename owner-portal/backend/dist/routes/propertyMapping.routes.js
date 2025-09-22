"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const propertyMapping_service_1 = require("../services/propertyMapping.service");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Get all property mappings - owners and accountants
router.get('/', auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, async (req, res) => {
    try {
        const mappings = (0, propertyMapping_service_1.getPropertyMappings)();
        res.json({ mappings });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get specific property mapping - owners and accountants
router.get('/:propertyId', auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, async (req, res) => {
    try {
        const { propertyId } = req.params;
        const mapping = (0, propertyMapping_service_1.getPropertyMapping)(Number(propertyId));
        if (!mapping) {
            return res.status(404).json({ message: 'Property mapping not found' });
        }
        res.json({ mapping });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Add new property mapping - owners only
router.post('/', auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, async (req, res) => {
    try {
        const mappingData = req.body;
        (0, propertyMapping_service_1.addPropertyMapping)(mappingData);
        res.json({ message: 'Property mapping added successfully', mapping: mappingData });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Update property mapping - owners only
router.put('/:propertyId', auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { platform, platformId } = req.body;
        const success = (0, propertyMapping_service_1.updatePropertyMapping)(Number(propertyId), platform, platformId);
        if (!success) {
            return res.status(404).json({ message: 'Property mapping not found' });
        }
        res.json({ message: 'Property mapping updated successfully' });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = router;
