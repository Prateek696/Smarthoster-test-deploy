import { Router } from "express";
import clientPromise from "../lib/mongodb";

const router = Router();

// Test route to verify global MongoDB connection pattern
router.get("/test-global-connection", async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Testing global MongoDB connection...');
    
    // Use the global connection pattern
    const client = await clientPromise;
    // Extract database name from URI or use default
    const dbName = process.env.MONGO_URI?.split('/').pop()?.split('?')[0] || 'smarthoster';
    const db = client.db(dbName);
    
    // Test query to users collection
    const userCount = await db.collection('users').countDocuments();
    
    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Global connection test successful: ${responseTime}ms`);
    
    res.json({
      status: "success",
      message: "Global MongoDB connection working",
      userCount: userCount,
      responseTime: `${responseTime}ms`,
      connectionType: "global",
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    console.error('❌ Global connection test failed:', error.message);
    
    res.status(500).json({
      status: "error",
      message: "Global MongoDB connection failed",
      error: error.message,
      responseTime: `${responseTime}ms`,
      connectionType: "global",
      timestamp: new Date().toISOString()
    });
  }
});

// Test route using old connection pattern for comparison
router.get("/test-old-connection", async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Testing old MongoDB connection...');
    
    // Import the old connection method
    const { connectDB } = await import('../config/db');
    const mongoose = await import('mongoose');
    
    // Ensure connection
    if (mongoose.default.connection.readyState !== 1) {
      await connectDB();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Test query using mongoose
    const User = mongoose.default.models.User || mongoose.default.model('User', new mongoose.default.Schema({}, { strict: false }));
    const userCount = await User.countDocuments();
    
    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Old connection test successful: ${responseTime}ms`);
    
    res.json({
      status: "success",
      message: "Old MongoDB connection working",
      userCount: userCount,
      responseTime: `${responseTime}ms`,
      connectionType: "mongoose",
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    console.error('❌ Old connection test failed:', error.message);
    
    res.status(500).json({
      status: "error",
      message: "Old MongoDB connection failed",
      error: error.message,
      responseTime: `${responseTime}ms`,
      connectionType: "mongoose",
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
