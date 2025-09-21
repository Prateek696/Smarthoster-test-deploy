"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const property_model_1 = __importDefault(require("../models/property.model"));
const User_model_1 = require("../models/User.model");
const env_1 = require("../config/env");
const axios_1 = __importDefault(require("axios"));
async function compareHostkitPropertyDetails() {
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
        console.log(`\n📊 Comparing ${properties.length} properties with Hostkit data...\n`);
        if (properties.length === 0) {
            console.log('❌ No properties found');
            return;
        }
        // Test each property
        for (const property of properties) {
            console.log(`\n🏠 Property: ${property.name} (ID: ${property.id})`);
            console.log(`   Hostkit ID: ${property.hostkitId}`);
            console.log(`   API Key: ${property.hostkitApiKey ? 'Present' : 'Missing'}`);
            console.log(`\n   📊 Database Data:`);
            console.log(`   - Type: ${property.type}`);
            console.log(`   - Bedrooms: ${property.bedrooms}`);
            console.log(`   - Bathrooms: ${property.bathrooms}`);
            console.log(`   - Max Guests: ${property.maxGuests}`);
            console.log(`   - Status: ${property.status}`);
            console.log(`   - Amenities: ${property.amenities.join(', ')}`);
            try {
                // Try to get property details from Hostkit
                console.log(`\n   🔍 Fetching property details from Hostkit...`);
                // Test different Hostkit endpoints that might have property details
                const endpoints = [
                    `https://app.hostkit.pt/api/getProperties?APIKEY=${property.hostkitApiKey}`,
                    `https://app.hostkit.pt/api/getPropertyDetails?APIKEY=${property.hostkitApiKey}&property_id=${property.hostkitId}`,
                    `https://app.hostkit.pt/api/getProperty?APIKEY=${property.hostkitApiKey}&property_id=${property.hostkitId}`
                ];
                let hostkitPropertyData = null;
                let workingEndpoint = null;
                for (const endpoint of endpoints) {
                    try {
                        console.log(`   🔗 Trying: ${endpoint.split('?')[0]}...`);
                        const response = await axios_1.default.get(endpoint, { timeout: 10000 });
                        if (response.data && (Array.isArray(response.data) || response.data.result)) {
                            hostkitPropertyData = response.data;
                            workingEndpoint = endpoint;
                            console.log(`   ✅ Success with: ${endpoint.split('?')[0]}`);
                            break;
                        }
                    }
                    catch (endpointError) {
                        console.log(`   ❌ Failed: ${endpointError.message}`);
                    }
                }
                if (hostkitPropertyData) {
                    console.log(`\n   📋 Hostkit Property Data:`);
                    if (Array.isArray(hostkitPropertyData)) {
                        const propertyData = hostkitPropertyData.find(p => p.id === property.hostkitId || p.property_id === property.hostkitId);
                        if (propertyData) {
                            console.log(`   - Name: ${propertyData.name || propertyData.title || 'N/A'}`);
                            console.log(`   - Type: ${propertyData.type || propertyData.property_type || 'N/A'}`);
                            console.log(`   - Bedrooms: ${propertyData.bedrooms || propertyData.bedroom_count || 'N/A'}`);
                            console.log(`   - Bathrooms: ${propertyData.bathrooms || propertyData.bathroom_count || 'N/A'}`);
                            console.log(`   - Max Guests: ${propertyData.max_guests || propertyData.guest_capacity || 'N/A'}`);
                            console.log(`   - Status: ${propertyData.status || propertyData.active || 'N/A'}`);
                            // Compare with database
                            console.log(`\n   🔄 Comparison:`);
                            console.log(`   - Type Match: ${property.type === (propertyData.type || propertyData.property_type) ? '✅' : '❌'}`);
                            console.log(`   - Bedrooms Match: ${property.bedrooms === (propertyData.bedrooms || propertyData.bedroom_count) ? '✅' : '❌'}`);
                            console.log(`   - Bathrooms Match: ${property.bathrooms === (propertyData.bathrooms || propertyData.bathroom_count) ? '✅' : '❌'}`);
                            console.log(`   - Max Guests Match: ${property.maxGuests === (propertyData.max_guests || propertyData.guest_capacity) ? '✅' : '❌'}`);
                        }
                        else {
                            console.log(`   ❌ Property not found in Hostkit response`);
                        }
                    }
                    else if (hostkitPropertyData.result) {
                        const propertyData = hostkitPropertyData.result;
                        console.log(`   - Name: ${propertyData.name || propertyData.title || 'N/A'}`);
                        console.log(`   - Type: ${propertyData.type || propertyData.property_type || 'N/A'}`);
                        console.log(`   - Bedrooms: ${propertyData.bedrooms || propertyData.bedroom_count || 'N/A'}`);
                        console.log(`   - Bathrooms: ${propertyData.bathrooms || propertyData.bathroom_count || 'N/A'}`);
                        console.log(`   - Max Guests: ${propertyData.max_guests || propertyData.guest_capacity || 'N/A'}`);
                        console.log(`   - Status: ${propertyData.status || propertyData.active || 'N/A'}`);
                        // Compare with database
                        console.log(`\n   🔄 Comparison:`);
                        console.log(`   - Type Match: ${property.type === (propertyData.type || propertyData.property_type) ? '✅' : '❌'}`);
                        console.log(`   - Bedrooms Match: ${property.bedrooms === (propertyData.bedrooms || propertyData.bedroom_count) ? '✅' : '❌'}`);
                        console.log(`   - Bathrooms Match: ${property.bathrooms === (propertyData.bathrooms || propertyData.bathroom_count) ? '✅' : '❌'}`);
                        console.log(`   - Max Guests Match: ${property.maxGuests === (propertyData.max_guests || propertyData.guest_capacity) ? '✅' : '❌'}`);
                    }
                    else {
                        console.log(`   📊 Raw Hostkit Response: ${JSON.stringify(hostkitPropertyData, null, 2).substring(0, 300)}...`);
                    }
                }
                else {
                    console.log(`   ❌ Could not fetch property details from Hostkit`);
                    console.log(`   ℹ️  This might be normal - Hostkit may not provide property specifications via API`);
                    console.log(`   ℹ️  Property details are typically managed in your property management system`);
                }
            }
            catch (error) {
                console.log(`   ❌ Error fetching from Hostkit: ${error.message}`);
            }
            console.log(`\n   ${'='.repeat(80)}`);
        }
        console.log(`\n🎯 Summary:`);
        console.log(`✅ Tested ${properties.length} properties against Hostkit`);
        console.log(`ℹ️  Property specifications are managed in your database`);
        console.log(`ℹ️  Hostkit provides reservation and booking data`);
        console.log(`ℹ️  Both systems work together for complete property management`);
    }
    catch (error) {
        console.error('Error comparing Hostkit property details:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}
// Run the test function if this file is executed directly
if (require.main === module) {
    compareHostkitPropertyDetails();
}
exports.default = compareHostkitPropertyDetails;
