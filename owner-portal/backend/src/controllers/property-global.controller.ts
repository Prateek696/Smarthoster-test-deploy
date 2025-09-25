import { Request, Response } from "express";
import clientPromise from "../lib/mongodb";
import { getPropertiesService } from "../services/property.service";
import { ObjectId } from "mongodb";

/**
 * @desc Get properties (using global MongoDB connection)
 * This is the NEW version that uses the global connection pattern
 */
export const getPropertiesGlobal = async (req: Request, res: Response) => {
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
    const client = await clientPromise;
    const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
    const db = client.db(dbName);

    // Get properties based on user role using native MongoDB client
    let properties;
    if (userRole === 'accountant') {
      // Accountants can see all properties
      properties = await db.collection('properties').find({}).toArray();
      console.log(`✅ Found ${properties.length} properties for accountant`);
    } else if (userRole === 'admin') {
      // Admins can see all properties
      properties = await db.collection('properties').find({}).toArray();
      console.log(`✅ Found ${properties.length} properties for admin`);
    } else {
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
  } catch (error: any) {
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

/**
 * @desc Get properties (ORIGINAL mongoose version)
 * This is the OLD version for comparison
 */
export const getPropertiesOriginal = async (req: Request, res: Response) => {
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
    const mongoose = await import("mongoose");
    const { ensureDBConnection } = await import("../config/db");
    
    await ensureDBConnection();

    // Use the existing service
    const result = await getPropertiesService(userId, userRole);
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ getPropertiesOriginal: Success in ${responseTime}ms`);

    res.status(200).json({
      ...result,
      connectionType: "mongoose",
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
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

/**
 * @desc Get dashboard metrics (using global MongoDB connection)
 * This is the NEW version that uses the global connection pattern
 */
export const getDashboardMetricsGlobal = async (req: Request, res: Response) => {
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
    const client = await clientPromise;
    const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
    const db = client.db(dbName);

    // Get properties based on user role using native MongoDB client
    let properties;
    if (userRole === 'accountant') {
      // Accountants can see all properties
      properties = await db.collection('properties').find({}).toArray();
      console.log(`✅ Found ${properties.length} properties for accountant`);
    } else {
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
  } catch (error: any) {
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

/**
 * @desc Get dashboard metrics (ORIGINAL mongoose version)
 * This is the OLD version for comparison
 */
export const getDashboardMetricsOriginal = async (req: Request, res: Response) => {
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
    const mongoose = await import("mongoose");
    const { ensureDBConnection } = await import("../config/db");
    
    await ensureDBConnection();

    // Import mongoose model
    const Property = await import("../models/property.model");
    
    // Get properties based on user role
    let properties;
    if (userRole === 'accountant') {
      // Accountants can see all properties
      properties = await Property.default.find({});
      console.log(`✅ Found ${properties.length} properties for accountant`);
    } else {
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
  } catch (error: any) {
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
