import { Request, Response } from "express";
import clientPromise from "../lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * @desc Get current user (using global MongoDB connection)
 * This is the NEW version that uses the global connection pattern
 */
export const getCurrentUserGlobal = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 getCurrentUserGlobal: Starting with global connection...');
    
    if (!req.user) {
      console.log('❌ Authentication required');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log(`👤 Getting user profile for: ${req.user.id}`);

    // Use global connection pattern
    const client = await clientPromise;
    const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
    const db = client.db(dbName);

    // Find user using native MongoDB client (excluding password)
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } } // Exclude password field
    );

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const responseTime = Date.now() - startTime;
    console.log(`✅ getCurrentUserGlobal: Success in ${responseTime}ms`);

    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        companies: user.companies,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      connectionType: "global",
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error('❌ getCurrentUserGlobal: Error:', error.message);
    
    res.status(500).json({ 
      message: 'Internal server error',
      connectionType: "global",
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc Get current user (ORIGINAL mongoose version)
 * This is the OLD version for comparison
 */
export const getCurrentUserOriginal = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 getCurrentUserOriginal: Starting with mongoose connection...');
    
    if (!req.user) {
      console.log('❌ Authentication required');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log(`👤 Getting user profile for: ${req.user.id}`);

    // Import mongoose and ensure connection
    const mongoose = await import("mongoose");
    const { ensureDBConnection } = await import("../config/db");
    
    await ensureDBConnection();

    // Use mongoose model
    const { UserModel } = await import("../models/User.model");
    const user = await UserModel.findById(req.user.id).select('-password');

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const responseTime = Date.now() - startTime;
    console.log(`✅ getCurrentUserOriginal: Success in ${responseTime}ms`);

    res.json({ 
      user,
      connectionType: "mongoose",
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error('❌ getCurrentUserOriginal: Error:', error.message);
    
    res.status(500).json({ 
      message: 'Internal server error',
      connectionType: "mongoose",
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc Update user profile (using global MongoDB connection)
 * This is the NEW version that uses the global connection pattern
 */
export const updateUserProfileGlobal = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 updateUserProfileGlobal: Starting with global connection...');
    
    if (!req.user) {
      console.log('❌ Authentication required');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { name, phone, companies } = req.body;
    console.log(`👤 Updating profile for user: ${req.user.id}`);

    // Validate input
    if (!name || name.trim().length < 2) {
      console.log('❌ Name must be at least 2 characters long');
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    // Use global connection pattern
    const client = await clientPromise;
    const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
    const db = client.db(dbName);

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      phone: phone?.trim() || undefined,
      updatedAt: new Date()
    };

    // Add companies if provided
    if (companies) {
      updateData.companies = companies;
    }

    // Update user profile using native MongoDB client
    const updateResult = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(req.user.id) },
      { $set: updateData },
      { returnDocument: 'after', projection: { password: 0 } }
    );

    if (!updateResult) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = updateResult;

    const responseTime = Date.now() - startTime;
    console.log(`✅ updateUserProfileGlobal: Success in ${responseTime}ms`);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        companies: updatedUser.companies,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      },
      connectionType: "global",
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error('❌ updateUserProfileGlobal: Error:', error.message);
    
    res.status(500).json({ 
      message: 'Internal server error',
      connectionType: "global",
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc Update user profile (ORIGINAL mongoose version)
 * This is the OLD version for comparison
 */
export const updateUserProfileOriginal = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 updateUserProfileOriginal: Starting with mongoose connection...');
    
    if (!req.user) {
      console.log('❌ Authentication required');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { name, phone, companies } = req.body;
    console.log(`👤 Updating profile for user: ${req.user.id}`);

    // Validate input
    if (!name || name.trim().length < 2) {
      console.log('❌ Name must be at least 2 characters long');
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    // Import mongoose and ensure connection
    const mongoose = await import("mongoose");
    const { ensureDBConnection } = await import("../config/db");
    
    await ensureDBConnection();

    // Use mongoose model
    const { UserModel } = await import("../models/User.model");

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      phone: phone?.trim() || undefined
    };

    // Add companies if provided
    if (companies) {
      updateData.companies = companies;
    }

    // Update user profile using mongoose
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const responseTime = Date.now() - startTime;
    console.log(`✅ updateUserProfileOriginal: Success in ${responseTime}ms`);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        companies: updatedUser.companies,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      },
      connectionType: "mongoose",
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error('❌ updateUserProfileOriginal: Error:', error.message);
    
    res.status(500).json({ 
      message: 'Internal server error',
      connectionType: "mongoose",
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  }
};
