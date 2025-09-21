"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const property_model_1 = __importDefault(require("../models/property.model"));
const router = express_1.default.Router();
// Debug endpoint to test property lookup
router.get('/property/:id', async (req, res) => {
    try {
        const propertyId = parseInt(req.params.id);
        console.log(`🔍 Debug: Looking up property ${propertyId}`);
        const property = await property_model_1.default.findOne({ id: propertyId });
        if (property) {
            console.log(`✅ Property found: ${property.name}, requiresCommission: ${property.requiresCommission}`);
            res.json({
                success: true,
                property: {
                    id: property.id,
                    name: property.name,
                    requiresCommission: property.requiresCommission
                }
            });
        }
        else {
            console.log(`❌ Property ${propertyId} not found`);
            res.json({
                success: false,
                message: `Property ${propertyId} not found`
            });
        }
    }
    catch (error) {
        console.error('❌ Error in debug endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Unknown error occurred'
        });
    }
});
exports.default = router;
