"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMongoDBStatus = exports.ensureTempCollection = exports.pingMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
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
const pingMongoDB = async () => {
    try {
        // Check if MongoDB is connected
        if (mongoose_1.default.connection.readyState !== 1) {
            console.log('⚠️ MongoDB not connected, skipping keep-alive');
            return false;
        }
        // Execute a simple query to keep the cluster awake
        // Using findOne with empty filter is lightweight and effective
        if (mongoose_1.default.connection.db) {
            await mongoose_1.default.connection.db.collection(TEMP_COLLECTION_NAME).findOne({});
        }
        else {
            throw new Error('MongoDB database connection not available');
        }
        console.log(`✅ MongoDB keep-alive successful: ${new Date().toISOString()}`);
        return true;
    }
    catch (error) {
        console.error('❌ MongoDB keep-alive failed:', error.message);
        return false;
    }
};
exports.pingMongoDB = pingMongoDB;
/**
 * Create the temporary collection if it doesn't exist
 * This ensures the keep-alive query always works
 */
const ensureTempCollection = async () => {
    try {
        if (mongoose_1.default.connection.readyState !== 1) {
            return;
        }
        // Check if collection exists
        if (mongoose_1.default.connection.db) {
            const collections = await mongoose_1.default.connection.db.listCollections({ name: TEMP_COLLECTION_NAME }).toArray();
            if (collections.length === 0) {
                // Create the collection with a simple document
                await mongoose_1.default.connection.db.collection(TEMP_COLLECTION_NAME).insertOne({
                    createdAt: new Date(),
                    purpose: 'MongoDB keep-alive collection'
                });
                console.log('✅ Created MongoDB keep-alive collection');
            }
        }
    }
    catch (error) {
        console.error('❌ Failed to create keep-alive collection:', error.message);
    }
};
exports.ensureTempCollection = ensureTempCollection;
/**
 * Get MongoDB connection status for monitoring
 */
const getMongoDBStatus = () => {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    return {
        readyState: mongoose_1.default.connection.readyState,
        status: states[mongoose_1.default.connection.readyState],
        host: mongoose_1.default.connection.host,
        port: mongoose_1.default.connection.port,
        name: mongoose_1.default.connection.name,
        timestamp: new Date().toISOString()
    };
};
exports.getMongoDBStatus = getMongoDBStatus;
