"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const property_model_1 = __importDefault(require("../models/property.model"));
const User_model_1 = require("../models/User.model");
const env_1 = require("../config/env");
// Import Hostkit API functions
const { getHostkitReservations } = require('../integrations/hostkit.api');
async function testHostkitPropertyData() {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(env_1.env.mongoUri);
        console.log('Connected to MongoDB');
        // Get your user
        const user = await User_model_1.UserModel.findOne({ email: 'krprateek758@gmail.com' });
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        // Get all properties
        const properties = await property_model_1.default.find({ owner: user._id });
        console.log(`\n📊 Testing ${properties.length} properties against Hostkit data...\n`);
        if (properties.length === 0) {
            console.log('❌ No properties found');
            return;
        }
        // Test each property
        for (const property of properties) {
            console.log(`\n🏠 Testing Property: ${property.name} (ID: ${property.id})`);
            console.log(`   Hostkit ID: ${property.hostkitId}`);
            console.log(`   Database Data:`);
            console.log(`   - Type: ${property.type}`);
            console.log(`   - Bedrooms: ${property.bedrooms}`);
            console.log(`   - Bathrooms: ${property.bathrooms}`);
            console.log(`   - Max Guests: ${property.maxGuests}`);
            try {
                // Test Hostkit API connection and get property data
                console.log(`\n   🔍 Fetching data from Hostkit...`);
                // Try to get reservations to test API connection
                const currentDate = new Date();
                const startDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
                const endDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
                const hostkitData = await getHostkitReservations(property.id, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
                console.log(`   ✅ Hostkit API Connection: SUCCESS`);
                console.log(`   📊 Hostkit Response Type: ${Array.isArray(hostkitData) ? 'Array' : typeof hostkitData}`);
                if (Array.isArray(hostkitData)) {
                    console.log(`   📈 Found ${hostkitData.length} reservations from Hostkit`);
                    if (hostkitData.length > 0) {
                        const sampleReservation = hostkitData[0];
                        console.log(`   📋 Sample Reservation Data:`);
                        console.log(`   - Guest: ${sampleReservation.guestName || 'N/A'}`);
                        console.log(`   - Check-in: ${sampleReservation.arrivalDate || 'N/A'}`);
                        console.log(`   - Check-out: ${sampleReservation.departureDate || 'N/A'}`);
                        console.log(`   - Total Price: €${sampleReservation.totalPrice || 'N/A'}`);
                        console.log(`   - Nights: ${sampleReservation.nights || 'N/A'}`);
                    }
                }
                else if (hostkitData && hostkitData.result) {
                    console.log(`   📈 Found ${hostkitData.result.length} reservations from Hostkit`);
                    if (hostkitData.result.length > 0) {
                        const sampleReservation = hostkitData.result[0];
                        console.log(`   📋 Sample Reservation Data:`);
                        console.log(`   - Guest: ${sampleReservation.guestName || 'N/A'}`);
                        console.log(`   - Check-in: ${sampleReservation.arrivalDate || 'N/A'}`);
                        console.log(`   - Check-out: ${sampleReservation.departureDate || 'N/A'}`);
                        console.log(`   - Total Price: €${sampleReservation.totalPrice || 'N/A'}`);
                        console.log(`   - Nights: ${sampleReservation.nights || 'N/A'}`);
                    }
                }
                else {
                    console.log(`   📊 Hostkit Response: ${JSON.stringify(hostkitData, null, 2).substring(0, 200)}...`);
                }
                // Note: Hostkit API doesn't typically return property details like bedrooms/bathrooms
                // It mainly returns reservation data. Property details are usually managed separately.
                console.log(`   ℹ️  Note: Hostkit API returns reservation data, not property specifications.`);
                console.log(`   ℹ️  Property details (bedrooms, bathrooms, type) are managed in your database.`);
            }
            catch (error) {
                console.log(`   ❌ Hostkit API Error: ${error.message}`);
                if (error.response) {
                    console.log(`   📊 Error Response: ${JSON.stringify(error.response.data, null, 2).substring(0, 200)}...`);
                }
            }
            console.log(`   ${'='.repeat(60)}`);
        }
        console.log(`\n🎯 Summary:`);
        console.log(`✅ Tested ${properties.length} properties`);
        console.log(`ℹ️  Property specifications (bedrooms, bathrooms, type) are stored in your database`);
        console.log(`ℹ️  Hostkit API provides reservation and booking data`);
        console.log(`ℹ️  Both data sources work together for complete property management`);
    }
    catch (error) {
        console.error('Error testing Hostkit property data:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}
// Run the test function if this file is executed directly
if (require.main === module) {
    testHostkitPropertyData();
}
exports.default = testHostkitPropertyData;
