"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardMetrics = exports.testHostkitConnection = exports.deleteProperty = exports.updateProperty = exports.getPropertyById = exports.getProperties = exports.createProperty = void 0;
const property_service_1 = require("../services/property.service");
const createProperty = async (req, res) => {
    try {
        const ownerId = req.user.id; // Changed from userId to id
        const propertyData = req.body;
        // Test Hostkit connection before creating property
        const connectionTest = await (0, property_service_1.testHostkitConnectionService)(propertyData.hostkitId, propertyData.hostkitApiKey);
        if (!connectionTest.success) {
            return res.status(400).json({
                message: "Failed to connect to Hostkit API",
                error: connectionTest.message,
            });
        }
        const property = await (0, property_service_1.createPropertyService)(propertyData, ownerId);
        res.status(201).json({
            message: "Property created successfully",
            property,
            hostkitTest: connectionTest,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Property ID already exists",
                error: "Duplicate property ID",
            });
        }
        res.status(500).json({
            message: "Error creating property",
            error: error.message,
        });
    }
};
exports.createProperty = createProperty;
const getProperties = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const properties = await (0, property_service_1.getPropertiesService)(ownerId);
        res.json({
            properties,
            total: properties.length,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching properties",
            error: error.message,
        });
    }
};
exports.getProperties = getProperties;
const getPropertyById = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const propertyId = req.params.propertyId;
        const property = await (0, property_service_1.getPropertyByIdService)(propertyId, ownerId);
        if (!property) {
            return res.status(404).json({
                message: "Property not found",
            });
        }
        res.json({ property });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching property",
            error: error.message,
        });
    }
};
exports.getPropertyById = getPropertyById;
const updateProperty = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const propertyId = req.params.propertyId;
        const propertyData = req.body;
        // If updating Hostkit credentials, test connection
        if (propertyData.hostkitId || propertyData.hostkitApiKey) {
            const property = await (0, property_service_1.getPropertyByIdService)(propertyId, ownerId);
            if (!property) {
                return res.status(404).json({ message: "Property not found" });
            }
            const hostkitId = propertyData.hostkitId || property.hostkitId;
            const apiKey = propertyData.hostkitApiKey || property.hostkitApiKey;
            const connectionTest = await (0, property_service_1.testHostkitConnectionService)(hostkitId, apiKey);
            if (!connectionTest.success) {
                return res.status(400).json({
                    message: "Failed to connect to Hostkit API",
                    error: connectionTest.message,
                });
            }
        }
        const property = await (0, property_service_1.updatePropertyService)(propertyId, propertyData, ownerId);
        if (!property) {
            return res.status(404).json({
                message: "Property not found",
            });
        }
        res.json({
            message: "Property updated successfully",
            property,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error updating property",
            error: error.message,
        });
    }
};
exports.updateProperty = updateProperty;
const deleteProperty = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const propertyId = req.params.propertyId;
        const deleted = await (0, property_service_1.deletePropertyService)(propertyId, ownerId);
        if (!deleted) {
            return res.status(404).json({
                message: "Property not found",
            });
        }
        res.json({
            message: "Property deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error deleting property",
            error: error.message,
        });
    }
};
exports.deleteProperty = deleteProperty;
const testHostkitConnection = async (req, res) => {
    try {
        const { hostkitId, apiKey } = req.body;
        if (!hostkitId || !apiKey) {
            return res.status(400).json({
                message: "Hostkit ID and API key are required",
            });
        }
        const connectionTest = await (0, property_service_1.testHostkitConnectionService)(hostkitId, apiKey);
        res.json(connectionTest);
    }
    catch (error) {
        res.status(500).json({
            message: "Error testing Hostkit connection",
            error: error.message,
        });
    }
};
exports.testHostkitConnection = testHostkitConnection;
const getDashboardMetrics = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { startDate, endDate } = req.query;
        // Use current year if no dates provided
        const currentYear = new Date().getFullYear();
        const defaultStartDate = startDate || `${currentYear}-01-01`;
        const defaultEndDate = endDate || `${currentYear}-12-31`;
        const metrics = await (0, property_service_1.getDashboardMetricsService)(ownerId, defaultStartDate, defaultEndDate);
        res.json(metrics);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching dashboard metrics",
            error: error.message,
        });
    }
};
exports.getDashboardMetrics = getDashboardMetrics;
