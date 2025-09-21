"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasValidApiKeys = exports.getOwnerApiKeys = exports.getHostkitApiSecretForProperty = exports.getHostkitApiKeyForProperty = void 0;
const OwnerApiKeys_model_1 = __importDefault(require("../models/OwnerApiKeys.model"));
const property_model_1 = __importDefault(require("../models/property.model"));
/**
 * Get Hostkit API key for a specific property
 * This replaces the hardcoded environment variable approach
 */
const getHostkitApiKeyForProperty = async (propertyId) => {
    try {
        // Find the property and get its API key directly
        const property = await property_model_1.default.findOne({ id: propertyId });
        if (!property) {
            console.warn(`Property ${propertyId} not found`);
            return null;
        }
        // Check if property has its own API key
        if (property.hostkitApiKey) {
            console.log(`✅ Using property's own API key for property ${propertyId}`);
            return property.hostkitApiKey;
        }
        // Fallback: Get the owner's API keys
        const apiKeys = await OwnerApiKeys_model_1.default.findOne({
            ownerId: property.owner.toString(),
            isActive: true
        });
        if (!apiKeys) {
            console.warn(`No active API keys found for owner ${property.owner}`);
            return null;
        }
        return apiKeys.hostkitApiKey;
    }
    catch (error) {
        console.error(`Error getting API key for property ${propertyId}:`, error);
        return null;
    }
};
exports.getHostkitApiKeyForProperty = getHostkitApiKeyForProperty;
/**
 * Get Hostkit API secret for a specific property
 */
const getHostkitApiSecretForProperty = async (propertyId) => {
    try {
        // Find the property to get its owner
        const property = await property_model_1.default.findOne({ id: propertyId });
        if (!property) {
            console.warn(`Property ${propertyId} not found`);
            return null;
        }
        // Get the owner's API keys
        const apiKeys = await OwnerApiKeys_model_1.default.findOne({
            ownerId: property.owner.toString(),
            isActive: true
        });
        if (!apiKeys) {
            console.warn(`No active API keys found for owner ${property.owner}`);
            return null;
        }
        return apiKeys.hostkitApiSecret;
    }
    catch (error) {
        console.error(`Error getting API secret for property ${propertyId}:`, error);
        return null;
    }
};
exports.getHostkitApiSecretForProperty = getHostkitApiSecretForProperty;
/**
 * Get all API keys for an owner
 */
const getOwnerApiKeys = async (ownerId) => {
    try {
        const apiKeys = await OwnerApiKeys_model_1.default.findOne({
            ownerId,
            isActive: true
        });
        return apiKeys ? {
            hostkitApiKey: apiKeys.hostkitApiKey,
            hostkitApiSecret: apiKeys.hostkitApiSecret,
            isActive: apiKeys.isActive
        } : null;
    }
    catch (error) {
        console.error(`Error getting API keys for owner ${ownerId}:`, error);
        return null;
    }
};
exports.getOwnerApiKeys = getOwnerApiKeys;
/**
 * Check if a property has valid API keys
 */
const hasValidApiKeys = async (propertyId) => {
    const apiKey = await (0, exports.getHostkitApiKeyForProperty)(propertyId);
    const apiSecret = await (0, exports.getHostkitApiSecretForProperty)(propertyId);
    return !!(apiKey && apiSecret);
};
exports.hasValidApiKeys = hasValidApiKeys;
