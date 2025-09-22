"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfiguredPropertyIds = exports.hasPropertySpecificApiKey = exports.getHostkitId = exports.getHostkitApiKey = void 0;
const env_1 = require("../config/env");
const dynamicApiKey_service_1 = require("../services/dynamicApiKey.service");
// Dynamic property mapping - will be fetched from database
const getPropertyToHostkitMapping = async () => {
    try {
        const PropertyModel = require('../models/property.model').default;
        const properties = await PropertyModel.find({});
        const mapping = {};
        properties.forEach((property) => {
            if (property.id && property.hostkitId) {
                mapping[property.id] = property.hostkitId;
            }
        });
        return mapping;
    }
    catch (error) {
        console.error('Error fetching property mapping from database:', error);
        return {};
    }
};
// Get the appropriate Hostkit API key for a specific property
// NEW: Uses dynamic API keys from database instead of hardcoded env variables
const getHostkitApiKey = async (propertyId) => {
    try {
        // First try to get API key from database (dynamic)
        const dynamicApiKey = await (0, dynamicApiKey_service_1.getHostkitApiKeyForProperty)(propertyId);
        if (dynamicApiKey) {
            console.log(`✅ Using dynamic API key for property ${propertyId}`);
            return dynamicApiKey;
        }
        // Fallback to old hardcoded system for backward compatibility
        const propertyMapping = await getPropertyToHostkitMapping();
        const hostkitId = propertyMapping[propertyId];
        if (hostkitId && env_1.env.hostkit.apiKeys && env_1.env.hostkit.apiKeys[hostkitId]) {
            console.log(`⚠️ Using fallback env API key for property ${propertyId}`);
            return env_1.env.hostkit.apiKeys[hostkitId];
        }
        // Final fallback to general API key
        if (env_1.env.hostkit.apiKey) {
            console.log(`⚠️ Using general env API key for property ${propertyId}`);
            return env_1.env.hostkit.apiKey;
        }
        console.warn(`❌ No Hostkit API key found for property ${propertyId}`);
        return null;
    }
    catch (error) {
        console.error(`Error getting API key for property ${propertyId}:`, error);
        return null;
    }
};
exports.getHostkitApiKey = getHostkitApiKey;
// Get Hostkit ID for a property (dynamic from database)
const getHostkitId = async (propertyId) => {
    try {
        const PropertyModel = require('../models/property.model').default;
        const property = await PropertyModel.findOne({ id: propertyId });
        return property ? property.hostkitId : null;
    }
    catch (error) {
        console.error(`Error fetching Hostkit ID for property ${propertyId}:`, error);
        return null;
    }
};
exports.getHostkitId = getHostkitId;
// Check if property has a specific API key configured (dynamic from database)
const hasPropertySpecificApiKey = async (propertyId) => {
    try {
        const hostkitId = await (0, exports.getHostkitId)(propertyId);
        return !!(hostkitId && env_1.env.hostkit.apiKeys[hostkitId]);
    }
    catch (error) {
        console.error(`Error checking API key for property ${propertyId}:`, error);
        return false;
    }
};
exports.hasPropertySpecificApiKey = hasPropertySpecificApiKey;
// Get all configured property IDs (dynamic from database)
const getConfiguredPropertyIds = async () => {
    try {
        const PropertyModel = require('../models/property.model').default;
        const properties = await PropertyModel.find({});
        return properties
            .filter((property) => property.id && property.hostkitId)
            .map((property) => property.id);
    }
    catch (error) {
        console.error('Error fetching configured property IDs:', error);
        return [];
    }
};
exports.getConfiguredPropertyIds = getConfiguredPropertyIds;
