"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePropertyOriginal = exports.updatePropertyGlobal = void 0;
const mongodb_1 = __importDefault(require("../lib/mongodb"));
const mongodb_2 = require("mongodb");
/**
 * @desc Update property (using global MongoDB connection)
 * This is the NEW version that uses the global connection pattern
 */
const updatePropertyGlobal = async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('🔄 updatePropertyGlobal: Starting with global connection...');
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
            console.log('❌ User not authenticated');
            return res.status(401).json({ message: "User not authenticated" });
        }
        // Handle property ID from params or body
        let actualPropertyId = propertyId;
        if (!actualPropertyId && updateData.propertyId) {
            actualPropertyId = updateData.propertyId.toString();
        }
        if (!actualPropertyId) {
            console.log('❌ Property ID is required');
            return res.status(400).json({ message: "Property ID is required" });
        }
        // Use global connection pattern
        const client = await mongodb_1.default;
        const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
        const db = client.db(dbName);
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
                filteredUpdateData.owner = new mongodb_2.ObjectId(filteredUpdateData.owner);
                filteredUpdateData.isAdminOwned = false;
            }
        }
        // Add validation for specific fields
        if (filteredUpdateData.bedrooms !== undefined && filteredUpdateData.bedrooms < 0) {
            console.log('❌ Bedrooms must be 0 or greater');
            return res.status(400).json({ message: "Bedrooms must be 0 or greater" });
        }
        if (filteredUpdateData.bathrooms !== undefined && filteredUpdateData.bathrooms < 0) {
            console.log('❌ Bathrooms must be 0 or greater');
            return res.status(400).json({ message: "Bathrooms must be 0 or greater" });
        }
        if (filteredUpdateData.maxGuests !== undefined && filteredUpdateData.maxGuests < 1) {
            console.log('❌ Max guests must be 1 or greater');
            return res.status(400).json({ message: "Max guests must be 1 or greater" });
        }
        if (filteredUpdateData.type && !['Apartment', 'House', 'Villa', 'Condominium', 'Penthouse', 'Studio'].includes(filteredUpdateData.type)) {
            console.log('❌ Invalid property type');
            return res.status(400).json({ message: "Invalid property type" });
        }
        if (filteredUpdateData.status && !['active', 'inactive', 'maintenance'].includes(filteredUpdateData.status)) {
            console.log('❌ Invalid status');
            return res.status(400).json({ message: "Invalid status" });
        }
        // Find the property and verify ownership using native MongoDB client
        // Try to find by numeric ID first, then by MongoDB _id
        let property = await db.collection('properties').findOne({
            id: parseInt(actualPropertyId)
        });
        if (!property) {
            // Try finding by MongoDB _id
            property = await db.collection('properties').findOne({
                _id: new mongodb_2.ObjectId(actualPropertyId)
            });
        }
        // Check ownership/permissions after finding the property
        if (property) {
            // If property is admin-owned, only admin can update it
            if (property.isAdminOwned) {
                const user = await db.collection('users').findOne({ _id: new mongodb_2.ObjectId(userId) });
                if (!user || user.role !== 'admin') {
                    console.log('❌ Only admin can update admin-owned properties');
                    return res.status(403).json({ message: "Only admin can update admin-owned properties" });
                }
            }
            // If property has an owner, check if user is the owner or admin
            else if (property.owner && property.owner.toString() !== userId) {
                const user = await db.collection('users').findOne({ _id: new mongodb_2.ObjectId(userId) });
                if (!user || user.role !== 'admin') {
                    console.log('❌ User does not have permission to update this property');
                    return res.status(403).json({ message: "You don't have permission to update this property" });
                }
            }
        }
        if (!property) {
            console.log('❌ Property not found or user does not have permission');
            return res.status(404).json({ message: "Property not found or you don't have permission to update it" });
        }
        console.log('✅ Found property:', {
            id: property.id,
            name: property.name,
            _id: property._id
        });
        // Update the property using native MongoDB client
        const updateResult = await db.collection('properties').findOneAndUpdate({ _id: property._id }, {
            $set: {
                ...filteredUpdateData,
                updatedAt: new Date()
            }
        }, { returnDocument: 'after' });
        if (!updateResult) {
            console.log('❌ Failed to update property');
            return res.status(500).json({ message: "Failed to update property" });
        }
        const updatedProperty = updateResult;
        const responseTime = Date.now() - startTime;
        console.log(`✅ updatePropertyGlobal: Success in ${responseTime}ms`);
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
            },
            connectionType: "global",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ updatePropertyGlobal: Error:', error.message);
        res.status(500).json({
            message: error.message || "Failed to update property",
            connectionType: "global",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
exports.updatePropertyGlobal = updatePropertyGlobal;
/**
 * @desc Update property (ORIGINAL mongoose version)
 * This is the OLD version for comparison
 */
const updatePropertyOriginal = async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('🔄 updatePropertyOriginal: Starting with mongoose connection...');
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
            console.log('❌ User not authenticated');
            return res.status(401).json({ message: "User not authenticated" });
        }
        // Handle property ID from params or body
        let actualPropertyId = propertyId;
        if (!actualPropertyId && updateData.propertyId) {
            actualPropertyId = updateData.propertyId.toString();
        }
        if (!actualPropertyId) {
            console.log('❌ Property ID is required');
            return res.status(400).json({ message: "Property ID is required" });
        }
        // Import mongoose and ensure connection
        const mongoose = await Promise.resolve().then(() => __importStar(require("mongoose")));
        const { ensureDBConnection } = await Promise.resolve().then(() => __importStar(require("../config/db")));
        await ensureDBConnection();
        // Import mongoose models
        const Property = await Promise.resolve().then(() => __importStar(require("../models/property.model")));
        const { UserModel } = await Promise.resolve().then(() => __importStar(require("../models/User.model")));
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
                filteredUpdateData.owner = new mongoose.Types.ObjectId(filteredUpdateData.owner);
                filteredUpdateData.isAdminOwned = false;
            }
        }
        // Add validation for specific fields
        if (filteredUpdateData.bedrooms !== undefined && filteredUpdateData.bedrooms < 0) {
            console.log('❌ Bedrooms must be 0 or greater');
            return res.status(400).json({ message: "Bedrooms must be 0 or greater" });
        }
        if (filteredUpdateData.bathrooms !== undefined && filteredUpdateData.bathrooms < 0) {
            console.log('❌ Bathrooms must be 0 or greater');
            return res.status(400).json({ message: "Bathrooms must be 0 or greater" });
        }
        if (filteredUpdateData.maxGuests !== undefined && filteredUpdateData.maxGuests < 1) {
            console.log('❌ Max guests must be 1 or greater');
            return res.status(400).json({ message: "Max guests must be 1 or greater" });
        }
        if (filteredUpdateData.type && !['Apartment', 'House', 'Villa', 'Condominium', 'Penthouse', 'Studio'].includes(filteredUpdateData.type)) {
            console.log('❌ Invalid property type');
            return res.status(400).json({ message: "Invalid property type" });
        }
        if (filteredUpdateData.status && !['active', 'inactive', 'maintenance'].includes(filteredUpdateData.status)) {
            console.log('❌ Invalid status');
            return res.status(400).json({ message: "Invalid status" });
        }
        // Find the property and verify ownership using mongoose
        // Try to find by numeric ID first, then by MongoDB _id
        let property = await Property.default.findOne({
            id: parseInt(actualPropertyId)
        });
        if (!property) {
            // Try finding by MongoDB _id
            property = await Property.default.findOne({
                _id: actualPropertyId
            });
        }
        // Check ownership/permissions after finding the property
        if (property) {
            // If property is admin-owned, only admin can update it
            if (property.isAdminOwned) {
                const user = await UserModel.findById(userId);
                if (!user || user.role !== 'admin') {
                    console.log('❌ Only admin can update admin-owned properties');
                    return res.status(403).json({ message: "Only admin can update admin-owned properties" });
                }
            }
            // If property has an owner, check if user is the owner or admin
            else if (property.owner && property.owner.toString() !== userId) {
                const user = await UserModel.findById(userId);
                if (!user || user.role !== 'admin') {
                    console.log('❌ User does not have permission to update this property');
                    return res.status(403).json({ message: "You don't have permission to update this property" });
                }
            }
        }
        if (!property) {
            console.log('❌ Property not found or user does not have permission');
            return res.status(404).json({ message: "Property not found or you don't have permission to update it" });
        }
        console.log('✅ Found property:', {
            id: property.id,
            name: property.name,
            _id: property._id
        });
        // Update the property using mongoose
        const updatedProperty = await Property.default.findOneAndUpdate({ _id: property._id }, {
            ...filteredUpdateData,
            updatedAt: new Date()
        }, { new: true, runValidators: true });
        if (!updatedProperty) {
            console.log('❌ Failed to update property');
            return res.status(500).json({ message: "Failed to update property" });
        }
        const responseTime = Date.now() - startTime;
        console.log(`✅ updatePropertyOriginal: Success in ${responseTime}ms`);
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
            },
            connectionType: "mongoose",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ updatePropertyOriginal: Error:', error.message);
        res.status(500).json({
            message: error.message || "Failed to update property",
            connectionType: "mongoose",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
exports.updatePropertyOriginal = updatePropertyOriginal;
