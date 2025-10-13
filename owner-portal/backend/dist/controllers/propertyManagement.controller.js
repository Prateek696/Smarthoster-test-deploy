"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testHostkitConnection = exports.getDashboardMetrics = exports.fetchHostawayPropertyDetails = exports.updateProperty = exports.getProperties = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const property_service_1 = require("../services/property.service");
const property_model_1 = __importDefault(require("../models/property.model"));
const User_model_1 = require("../models/User.model");
const hostaway_api_1 = require("../integrations/hostaway.api");
const getProperties = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const result = await (0, property_service_1.getPropertiesService)(userId, userRole);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: error.message || "Failed to fetch properties" });
    }
};
exports.getProperties = getProperties;
const updateProperty = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { propertyId } = req.params;
        const updateData = req.body;
        console.log('🔍 Update Property Request:', {
            userId,
            propertyId,
            updateData: Object.keys(updateData),
            bodyPropertyId: updateData.propertyId
        });
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        // Handle property ID from params or body
        let actualPropertyId = propertyId;
        if (!actualPropertyId && updateData.propertyId) {
            actualPropertyId = updateData.propertyId.toString();
        }
        if (!actualPropertyId) {
            return res.status(400).json({ message: "Property ID is required" });
        }
        // Validate allowed fields for update
        const allowedFields = [
            'name', 'address', 'type', 'bedrooms', 'bathrooms',
            'maxGuests', 'status', 'requiresCommission', 'images', 'amenities', 'owner'
        ];
        const filteredUpdateData = {};
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredUpdateData[key] = updateData[key];
            }
        });
        // Handle owner assignment
        if (filteredUpdateData.owner !== undefined) {
            if (filteredUpdateData.owner === 'admin') {
                filteredUpdateData.owner = null;
                filteredUpdateData.isAdminOwned = true;
            }
            else if (filteredUpdateData.owner === '' || filteredUpdateData.owner === null) {
                filteredUpdateData.owner = null;
                filteredUpdateData.isAdminOwned = false;
            }
            else {
                // Convert to ObjectId for regular owner assignment
                filteredUpdateData.owner = new mongoose_1.default.Types.ObjectId(filteredUpdateData.owner);
                filteredUpdateData.isAdminOwned = false;
            }
        }
        // Add validation for specific fields
        if (filteredUpdateData.bedrooms !== undefined && filteredUpdateData.bedrooms < 0) {
            return res.status(400).json({ message: "Bedrooms must be 0 or greater" });
        }
        if (filteredUpdateData.bathrooms !== undefined && filteredUpdateData.bathrooms < 0) {
            return res.status(400).json({ message: "Bathrooms must be 0 or greater" });
        }
        if (filteredUpdateData.maxGuests !== undefined && filteredUpdateData.maxGuests < 1) {
            return res.status(400).json({ message: "Max guests must be 1 or greater" });
        }
        if (filteredUpdateData.type && !['Apartment', 'House', 'Villa', 'Condominium', 'Penthouse', 'Studio'].includes(filteredUpdateData.type)) {
            return res.status(400).json({ message: "Invalid property type" });
        }
        if (filteredUpdateData.status && !['active', 'inactive', 'maintenance'].includes(filteredUpdateData.status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        // Find the property and verify ownership
        // Try to find by numeric ID first, then by MongoDB _id
        let property = await property_model_1.default.findOne({
            id: parseInt(actualPropertyId)
        });
        if (!property) {
            // Try finding by MongoDB _id
            property = await property_model_1.default.findOne({
                _id: actualPropertyId
            });
        }
        // Check ownership/permissions after finding the property
        if (property) {
            // If property is admin-owned, only admin can update it
            if (property.isAdminOwned) {
                const user = await User_model_1.UserModel.findById(userId);
                if (!user || user.role !== 'admin') {
                    return res.status(403).json({ message: "Only admin can update admin-owned properties" });
                }
            }
            // If property has an owner, check if user is the owner or admin
            else if (property.owner && property.owner.toString() !== userId) {
                const user = await User_model_1.UserModel.findById(userId);
                if (!user || user.role !== 'admin') {
                    return res.status(403).json({ message: "You don't have permission to update this property" });
                }
            }
        }
        if (!property) {
            return res.status(404).json({ message: "Property not found or you don't have permission to update it" });
        }
        console.log('✅ Found property:', {
            id: property.id,
            name: property.name,
            _id: property._id
        });
        // Update the property using the found property's ID
        const updatedProperty = await property_model_1.default.findOneAndUpdate({ _id: property._id }, {
            ...filteredUpdateData,
            updatedAt: new Date()
        }, { new: true, runValidators: true });
        if (!updatedProperty) {
            return res.status(500).json({ message: "Failed to update property" });
        }
        console.log(`✅ Property ${actualPropertyId} updated successfully:`, {
            updatedFields: Object.keys(filteredUpdateData),
            propertyName: updatedProperty.name,
            propertyId: updatedProperty.id
        });
        res.status(200).json({
            success: true,
            message: "Property updated successfully",
            property: {
                id: updatedProperty.id,
                name: updatedProperty.name,
                address: updatedProperty.address,
                type: updatedProperty.type,
                bedrooms: updatedProperty.bedrooms,
                bathrooms: updatedProperty.bathrooms,
                maxGuests: updatedProperty.maxGuests,
                status: updatedProperty.status,
                requiresCommission: updatedProperty.requiresCommission,
                images: updatedProperty.images,
                amenities: updatedProperty.amenities,
                updatedAt: updatedProperty.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({
            message: error.message || "Failed to update property",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
exports.updateProperty = updateProperty;
/**
 * Fetch property details from Hostaway by listing ID
 * Auto-populates property form fields
 */
const fetchHostawayPropertyDetails = async (req, res) => {
    try {
        const { hostawayListingId } = req.params;
        if (!hostawayListingId) {
            return res.status(400).json({ message: "Hostaway listing ID is required" });
        }
        const listingId = parseInt(hostawayListingId);
        if (isNaN(listingId)) {
            return res.status(400).json({ message: "Invalid Hostaway listing ID format" });
        }
        console.log(`🔍 Fetching Hostaway property details for listing ID: ${listingId}`);
        const propertyDetails = await (0, hostaway_api_1.getHostawayListingDetails)(listingId);
        res.status(200).json({
            success: true,
            data: propertyDetails,
            message: "Property details fetched successfully from Hostaway"
        });
    }
    catch (error) {
        console.error('❌ Error fetching Hostaway property details:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to fetch property details from Hostaway",
            details: error.details
        });
    }
};
exports.fetchHostawayPropertyDetails = fetchHostawayPropertyDetails;
const getDashboardMetrics = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        // Get properties based on user role
        let properties;
        if (userRole === 'accountant') {
            // Accountants can see all properties
            properties = await property_model_1.default.find({});
        }
        else {
            // Owners and other roles see only their properties (exclude admin properties)
            properties = await property_model_1.default.find({ owner: userId, isAdminOwned: false });
        }
        // For now, return basic metrics with mock data
        // In a real application, you would calculate these from actual booking/revenue data
        const metrics = {
            totalRevenue: 0,
            totalBookings: 0,
            totalNights: 0,
            averageOccupancy: 0,
            averageDailyRate: 0,
            properties: properties.map(property => ({
                id: property.id,
                name: property.name,
                revenue: 0,
                bookings: 0,
                occupancy: 0,
                nights: 0
            })),
            recentBookings: []
        };
        res.status(200).json(metrics);
    }
    catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        res.status(500).json({
            message: error.message || "Failed to fetch dashboard metrics",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
exports.getDashboardMetrics = getDashboardMetrics;
// Secure test Hostkit connection using stored API keys
const testHostkitConnection = async (req, res) => {
    try {
        const { propertyId } = req.body;
        if (!propertyId) {
            return res.status(400).json({
                message: "Property ID is required"
            });
        }
        // Get property from database
        const property = await property_model_1.default.findOne({ id: parseInt(propertyId) });
        if (!property) {
            return res.status(404).json({
                message: "Property not found"
            });
        }
        // Check if user has permission to test this property
        const userRole = req.user.role;
        const userId = req.user.id;
        if (userRole !== 'admin' && property.owner !== userId) {
            return res.status(403).json({
                message: "You don't have permission to test this property's connection"
            });
        }
        // Get API key from database (secure)
        const { getHostkitApiKey } = require('../utils/propertyApiKey');
        const apiKey = await getHostkitApiKey(parseInt(propertyId));
        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: "No API key configured for this property"
            });
        }
        // Test connection using stored API key
        const { testHostkitConnectionService } = require('../services/property.service');
        const connectionTest = await testHostkitConnectionService(property.hostkitId, apiKey);
        res.json(connectionTest);
    }
    catch (error) {
        console.error('Error testing Hostkit connection:', error);
        res.status(500).json({
            message: "Error testing Hostkit connection",
            error: error.message
        });
    }
};
exports.testHostkitConnection = testHostkitConnection;
