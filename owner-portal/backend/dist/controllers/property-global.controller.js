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
exports.getDashboardMetricsOriginal = exports.getDashboardMetricsGlobal = exports.getPropertiesOriginal = exports.getPropertiesGlobal = void 0;
const mongodb_1 = __importDefault(require("../lib/mongodb"));
const property_service_1 = require("../services/property.service");
/**
 * @desc Get properties (using global MongoDB connection)
 * This is the NEW version that uses the global connection pattern
 */
const getPropertiesGlobal = async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('🔄 getPropertiesGlobal: Starting with global connection...');
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId) {
            console.log('❌ User not authenticated');
            return res.status(401).json({ message: "User not authenticated" });
        }
        console.log(`📋 Getting properties for user: ${userId}, role: ${userRole}`);
        // Use global connection pattern
        const client = await mongodb_1.default;
        const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
        const db = client.db(dbName);
        // Get properties based on user role using native MongoDB client
        let properties;
        if (userRole === 'accountant') {
            // Accountants can see all properties
            properties = await db.collection('properties').find({}).toArray();
            console.log(`✅ Found ${properties.length} properties for accountant`);
        }
        else if (userRole === 'admin') {
            // Admins can see all properties
            properties = await db.collection('properties').find({}).toArray();
            console.log(`✅ Found ${properties.length} properties for admin`);
        }
        else {
            // Owners and other roles see only their properties (exclude admin properties)
            properties = await db.collection('properties').find({
                owner: userId,
                isAdminOwned: false
            }).toArray();
            console.log(`✅ Found ${properties.length} properties for owner`);
        }
        const responseTime = Date.now() - startTime;
        console.log(`✅ getPropertiesGlobal: Success in ${responseTime}ms`);
        res.status(200).json({
            properties: properties.map(property => ({
                id: property.id,
                name: property.name,
                address: property.address,
                type: property.type,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                maxGuests: property.maxGuests,
                status: property.status,
                requiresCommission: property.requiresCommission,
                images: property.images,
                amenities: property.amenities,
                owner: property.owner,
                isAdminOwned: property.isAdminOwned,
                createdAt: property.createdAt,
                updatedAt: property.updatedAt
            })),
            connectionType: "global",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ getPropertiesGlobal: Error:', error.message);
        res.status(500).json({
            message: error.message || "Failed to fetch properties",
            connectionType: "global",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
};
exports.getPropertiesGlobal = getPropertiesGlobal;
/**
 * @desc Get properties (ORIGINAL mongoose version)
 * This is the OLD version for comparison
 */
const getPropertiesOriginal = async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('🔄 getPropertiesOriginal: Starting with mongoose connection...');
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId) {
            console.log('❌ User not authenticated');
            return res.status(401).json({ message: "User not authenticated" });
        }
        console.log(`📋 Getting properties for user: ${userId}, role: ${userRole}`);
        // Import mongoose and ensure connection
        const mongoose = await Promise.resolve().then(() => __importStar(require("mongoose")));
        const { ensureDBConnection } = await Promise.resolve().then(() => __importStar(require("../config/db")));
        await ensureDBConnection();
        // Use the existing service
        const result = await (0, property_service_1.getPropertiesService)(userId, userRole);
        const responseTime = Date.now() - startTime;
        console.log(`✅ getPropertiesOriginal: Success in ${responseTime}ms`);
        res.status(200).json({
            ...result,
            connectionType: "mongoose",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ getPropertiesOriginal: Error:', error.message);
        res.status(500).json({
            message: error.message || "Failed to fetch properties",
            connectionType: "mongoose",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
};
exports.getPropertiesOriginal = getPropertiesOriginal;
/**
 * @desc Get dashboard metrics (using global MongoDB connection)
 * This is the NEW version that uses the global connection pattern
 */
const getDashboardMetricsGlobal = async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('🔄 getDashboardMetricsGlobal: Starting with global connection...');
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId) {
            console.log('❌ User not authenticated');
            return res.status(401).json({ message: "User not authenticated" });
        }
        console.log(`📊 Getting dashboard metrics for user: ${userId}, role: ${userRole}`);
        // Use global connection pattern
        const client = await mongodb_1.default;
        const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
        const db = client.db(dbName);
        // Get properties based on user role using native MongoDB client
        let properties;
        if (userRole === 'accountant') {
            // Accountants can see all properties
            properties = await db.collection('properties').find({}).toArray();
            console.log(`✅ Found ${properties.length} properties for accountant`);
        }
        else {
            // Owners and other roles see only their properties (exclude admin properties)
            properties = await db.collection('properties').find({
                owner: userId,
                isAdminOwned: false
            }).toArray();
            console.log(`✅ Found ${properties.length} properties for owner`);
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
            recentBookings: [],
            connectionType: "global",
            responseTime: `${Date.now() - startTime}ms`,
            timestamp: new Date().toISOString()
        };
        const responseTime = Date.now() - startTime;
        console.log(`✅ getDashboardMetricsGlobal: Success in ${responseTime}ms`);
        res.status(200).json(metrics);
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ getDashboardMetricsGlobal: Error:', error.message);
        res.status(500).json({
            message: error.message || "Failed to fetch dashboard metrics",
            connectionType: "global",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
};
exports.getDashboardMetricsGlobal = getDashboardMetricsGlobal;
/**
 * @desc Get dashboard metrics (ORIGINAL mongoose version)
 * This is the OLD version for comparison
 */
const getDashboardMetricsOriginal = async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('🔄 getDashboardMetricsOriginal: Starting with mongoose connection...');
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId) {
            console.log('❌ User not authenticated');
            return res.status(401).json({ message: "User not authenticated" });
        }
        console.log(`📊 Getting dashboard metrics for user: ${userId}, role: ${userRole}`);
        // Import mongoose and ensure connection
        const mongoose = await Promise.resolve().then(() => __importStar(require("mongoose")));
        const { ensureDBConnection } = await Promise.resolve().then(() => __importStar(require("../config/db")));
        await ensureDBConnection();
        // Import mongoose model
        const Property = await Promise.resolve().then(() => __importStar(require("../models/property.model")));
        // Get properties based on user role
        let properties;
        if (userRole === 'accountant') {
            // Accountants can see all properties
            properties = await Property.default.find({});
            console.log(`✅ Found ${properties.length} properties for accountant`);
        }
        else {
            // Owners and other roles see only their properties (exclude admin properties)
            properties = await Property.default.find({ owner: userId, isAdminOwned: false });
            console.log(`✅ Found ${properties.length} properties for owner`);
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
            recentBookings: [],
            connectionType: "mongoose",
            responseTime: `${Date.now() - startTime}ms`,
            timestamp: new Date().toISOString()
        };
        const responseTime = Date.now() - startTime;
        console.log(`✅ getDashboardMetricsOriginal: Success in ${responseTime}ms`);
        res.status(200).json(metrics);
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ getDashboardMetricsOriginal: Error:', error.message);
        res.status(500).json({
            message: error.message || "Failed to fetch dashboard metrics",
            connectionType: "mongoose",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
};
exports.getDashboardMetricsOriginal = getDashboardMetricsOriginal;
