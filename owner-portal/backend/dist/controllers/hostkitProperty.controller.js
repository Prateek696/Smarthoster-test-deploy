"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProperty = void 0;
const hostkitProperty_service_1 = require("../services/hostkitProperty.service");
const getProperty = async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        // Validate input
        if (!propertyId) {
            return res.status(400).json({
                message: "Missing required parameter: propertyId"
            });
        }
        const result = await (0, hostkitProperty_service_1.getPropertyService)({
            propertyId
        });
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('Property retrieval error:', error);
        res.status(500).json({
            message: error.message || "Property retrieval failed"
        });
    }
};
exports.getProperty = getProperty;
