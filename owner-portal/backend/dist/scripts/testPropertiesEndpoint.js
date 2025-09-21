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
const mongoose_1 = __importDefault(require("mongoose"));
const property_model_1 = __importDefault(require("../models/property.model"));
const User_model_1 = require("../models/User.model");
const env_1 = require("../config/env");
const jwt_1 = require("../utils/jwt");
async function testPropertiesEndpoint() {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(env_1.env.mongoUri);
        console.log('Connected to MongoDB');
        // Get the owner user
        const owner = await User_model_1.UserModel.findOne({ role: 'owner' });
        if (!owner) {
            console.log('❌ No owner user found. Run the seed script first.');
            return;
        }
        console.log(`✅ Found owner: ${owner.name} (${owner.email})`);
        console.log(`   Owner ID: ${owner._id}`);
        // Get all properties for this owner
        const properties = await property_model_1.default.find({ owner: owner._id });
        console.log(`\n📊 Found ${properties.length} properties in database:`);
        if (properties.length === 0) {
            console.log('❌ No properties found. Run the seed script first: npm run seed:properties');
            return;
        }
        properties.forEach((property, index) => {
            console.log(`${index + 1}. ${property.name} (ID: ${property.id})`);
            console.log(`   Owner: ${property.owner}`);
            console.log(`   Type: ${property.type}, Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}`);
        });
        // Test the properties service directly
        console.log('\n🔍 Testing getPropertiesService directly...');
        const propertyService = await Promise.resolve().then(() => __importStar(require('../services/property.service')));
        const serviceResult = await propertyService.getPropertiesService(owner._id.toString());
        console.log(`Service returned ${serviceResult.properties.length} properties`);
        // Generate a JWT token for testing
        console.log('\n🔑 Generating JWT token for testing...');
        const payload = { id: owner._id, role: owner.role };
        const token = (0, jwt_1.generateAccessToken)(payload);
        console.log(`JWT Token: ${token.substring(0, 50)}...`);
        // Test the API endpoint simulation
        console.log('\n🌐 Testing API endpoint simulation...');
        const mockReq = {
            user: { id: owner._id.toString(), role: owner.role }
        };
        // Simulate the controller logic
        try {
            const serviceResult = await propertyService.getPropertiesService(owner._id.toString());
            const response = {
                properties: serviceResult.properties,
                total: serviceResult.properties.length,
            };
            console.log('✅ API simulation successful!');
            console.log(`Response: ${JSON.stringify(response, null, 2)}`);
        }
        catch (error) {
            console.log('❌ API simulation failed:', error);
        }
        console.log('\n✅ Properties endpoint should work correctly!');
        console.log('Make sure you are logged in as the owner user to see the properties.');
    }
    catch (error) {
        console.error('Error testing properties endpoint:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}
// Run the test function if this file is executed directly
if (require.main === module) {
    testPropertiesEndpoint();
}
exports.default = testPropertiesEndpoint;
