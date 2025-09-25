import mongoose, { ConnectionStates } from 'mongoose';
import { connectDB } from '../config/db';

/**
 * MongoDB Keep-Alive Utility
 * Prevents MongoDB Atlas free tier from going to sleep
 */

// Create a temporary collection for keep-alive queries
const TEMP_COLLECTION_NAME = 'keep_alive_temp';

/**
 * Execute a simple MongoDB query to keep the cluster awake
 * @returns Promise<boolean> - true if successful, false if failed
 */
export const pingMongoDB = async (retries: number = 3): Promise<boolean> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 MongoDB keep-alive attempt ${attempt}/${retries}`);
      
      // Ensure MongoDB is connected
      if ((mongoose.connection.readyState as number) !== 1) {
        console.log('🔄 MongoDB not connected, attempting to connect...');
        await connectDB();
        
        // Wait longer for connection to establish
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if ((mongoose.connection.readyState as number) !== 1) {
          console.log('⚠️ MongoDB connection failed');
          if (attempt < retries) {
            console.log(`⏳ Retrying in 3 seconds... (attempt ${attempt + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue;
          }
          return false;
        }
      }

      // Execute a simple query to keep the cluster awake
      // Using findOne with empty filter is lightweight and effective
      if (mongoose.connection.db) {
        await mongoose.connection.db.collection(TEMP_COLLECTION_NAME).findOne({});
      } else {
        throw new Error('MongoDB database connection not available');
      }
      
      console.log(`✅ MongoDB keep-alive successful: ${new Date().toISOString()}`);
      return true;
    } catch (error: any) {
      console.error(`❌ MongoDB keep-alive attempt ${attempt} failed:`, error.message);
      if (attempt < retries) {
        console.log(`⏳ Retrying in 3 seconds... (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  
  console.error('❌ All MongoDB keep-alive attempts failed');
  return false;
};

/**
 * Create the temporary collection if it doesn't exist
 * This ensures the keep-alive query always works
 */
export const ensureTempCollection = async (): Promise<void> => {
  try {
    if ((mongoose.connection.readyState as number) !== 1) {
      return;
    }

    // Check if collection exists
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections({ name: TEMP_COLLECTION_NAME }).toArray();
      
      if (collections.length === 0) {
        // Create the collection with a simple document
        await mongoose.connection.db.collection(TEMP_COLLECTION_NAME).insertOne({
          createdAt: new Date(),
          purpose: 'MongoDB keep-alive collection'
        });
        
        console.log('✅ Created MongoDB keep-alive collection');
      }
    }
  } catch (error: any) {
    console.error('❌ Failed to create keep-alive collection:', error.message);
  }
};

/**
 * Get MongoDB connection status for monitoring
 */
export const getMongoDBStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    readyState: mongoose.connection.readyState,
    status: states[mongoose.connection.readyState as keyof typeof states],
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    timestamp: new Date().toISOString()
  };
};
