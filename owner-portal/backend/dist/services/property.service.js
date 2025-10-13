"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testHostkitConnectionService = exports.getCompanyNameByPropertyId = exports.getPropertiesService = void 0;
const property_model_1 = __importDefault(require("../models/property.model"));
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
// Get properties for a specific owner or all properties for accountants/admin
const getPropertiesService = async (ownerId, userRole, selectedOwnerId) => {
    try {
        let properties;
        // If user is admin and has selected a specific owner, show only that owner's properties
        if (userRole === 'admin' && selectedOwnerId) {
            if (selectedOwnerId === 'admin') {
                // Show only admin-owned properties
                properties = await property_model_1.default.find({ isAdminOwned: true });
            }
            else {
                // Show only properties owned by the selected owner (exclude admin properties)
                properties = await property_model_1.default.find({ owner: selectedOwnerId, isAdminOwned: false });
            }
        }
        // If user is admin and no specific owner selected, show all properties
        else if (userRole === 'admin') {
            properties = await property_model_1.default.find({});
        }
        // If user is accountant, show only assigned properties
        else if (userRole === 'accountant') {
            properties = await property_model_1.default.find({ accountants: ownerId });
            console.log(`📊 Accountant ${ownerId}: Found ${properties.length} assigned properties`);
        }
        else {
            // For owners and other roles, show only their properties (exclude admin properties)
            properties = await property_model_1.default.find({ owner: ownerId, isAdminOwned: false });
        }
        console.log('🔍 getPropertiesService returning:', {
            userRole,
            selectedOwnerId,
            propertiesCount: properties.length,
            propertyIds: properties.map(p => p.id),
            propertyNames: properties.map(p => p.name),
            adminProperties: properties.filter(p => p.isAdminOwned).length
        });
        // Sanitize properties to remove sensitive API keys
        const sanitizedProperties = properties.map(property => {
            const { hostkitApiKey, ...sanitizedProperty } = property.toObject();
            return sanitizedProperty;
        });
        return {
            properties: sanitizedProperties,
            total: sanitizedProperties.length
        };
    }
    catch (error) {
        console.error('Error fetching properties:', error);
        throw error;
    }
};
exports.getPropertiesService = getPropertiesService;
const getCompanyNameByPropertyId = async (propertyId, field) => {
    try {
        const property = await property_model_1.default.findOne({ id: propertyId });
        if (!property) {
            throw new Error(`Property with ID ${propertyId} not found`);
        }
        return property[field] || property.name || `Property ${propertyId}`;
    }
    catch (error) {
        console.error('Error fetching company name:', error);
        throw error;
    }
};
exports.getCompanyNameByPropertyId = getCompanyNameByPropertyId;
// Test Hostkit connection using provided credentials
const testHostkitConnectionService = async (hostkitId, apiKey) => {
    try {
        console.log('🔍 Testing Hostkit connection:', {
            hostkitId,
            apiKeyPresent: !!apiKey,
            apiKeyLength: apiKey ? apiKey.length : 0
        });
        // Test connection by making a simple API call
        const response = await axios_1.default.get(`${env_1.env.hostkit.apiUrl}/getProperty`, {
            params: {
                APIKEY: apiKey,
                property_id: hostkitId
            },
            timeout: 10000 // 10 second timeout
        });
        if (response.data && response.data.success !== false) {
            return {
                success: true,
                message: "Hostkit connection successful",
                data: {
                    propertyId: hostkitId,
                    propertyName: response.data.property?.name || 'Unknown',
                    status: 'connected'
                }
            };
        }
        else {
            return {
                success: false,
                message: "Hostkit API returned an error",
                data: response.data
            };
        }
    }
    catch (error) {
        console.error('❌ Hostkit connection test failed:', error.message);
        if (error.response) {
            // API returned an error response
            const errorMessage = error.response.data?.message || error.response.data?.error || 'API request failed';
            return {
                success: false,
                message: `Hostkit API Error: ${errorMessage}`,
                data: error.response.data
            };
        }
        else if (error.request) {
            // Request was made but no response received
            return {
                success: false,
                message: 'Unable to connect to Hostkit API. Please check your internet connection.',
                data: null
            };
        }
        else {
            // Something else happened
            return {
                success: false,
                message: `Connection test failed: ${error.message}`,
                data: null
            };
        }
    }
};
exports.testHostkitConnectionService = testHostkitConnectionService;
