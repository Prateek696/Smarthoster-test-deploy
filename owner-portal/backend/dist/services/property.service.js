"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyNameByPropertyId = exports.getPropertiesService = void 0;
const property_model_1 = __importDefault(require("../models/property.model"));
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
        // If user is accountant, show all properties
        else if (userRole === 'accountant') {
            properties = await property_model_1.default.find({});
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
        return {
            properties,
            total: properties.length
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
