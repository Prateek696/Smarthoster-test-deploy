"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const property_model_1 = __importDefault(require("../models/property.model"));
const User_model_1 = require("../models/User.model");
const env_1 = require("../config/env");
async function fixPropertyOwnership() {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(env_1.env.mongoUri);
        console.log('Connected to MongoDB');
        // Get your actual user (the one you're logged in as)
        const actualUser = await User_model_1.UserModel.findOne({ email: 'krprateek758@gmail.com' });
        if (!actualUser) {
            console.log('❌ Your user not found. Make sure you are logged in.');
            return;
        }
        console.log(`✅ Found your user: ${actualUser.firstName || actualUser.name} (${actualUser.email})`);
        console.log(`   Your User ID: ${actualUser._id}`);
        // Get all properties (regardless of owner)
        const allProperties = await property_model_1.default.find({});
        console.log(`\n📊 Found ${allProperties.length} properties in database:`);
        if (allProperties.length === 0) {
            console.log('❌ No properties found. Run the seed script first: npm run seed:properties');
            return;
        }
        // Show current ownership
        allProperties.forEach((property, index) => {
            console.log(`${index + 1}. ${property.name} (ID: ${property.id})`);
            console.log(`   Current Owner: ${property.owner}`);
            console.log(`   Your User ID:  ${actualUser._id}`);
            console.log(`   Match: ${property.owner.toString() === actualUser._id.toString() ? '✅' : '❌'}`);
        });
        // Update all properties to be owned by your user
        console.log('\n🔧 Updating property ownership...');
        const updateResult = await property_model_1.default.updateMany({}, // Update all properties
        { owner: actualUser._id });
        console.log(`✅ Updated ${updateResult.modifiedCount} properties to be owned by you`);
        // Verify the update
        console.log('\n🔍 Verifying ownership update...');
        const yourProperties = await property_model_1.default.find({ owner: actualUser._id });
        console.log(`✅ You now own ${yourProperties.length} properties:`);
        yourProperties.forEach((property, index) => {
            console.log(`${index + 1}. ${property.name} (ID: ${property.id})`);
            console.log(`   Type: ${property.type}, Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}`);
        });
        console.log('\n🎉 Property ownership fixed!');
        console.log('Now refresh your dashboard and you should see all the properties.');
    }
    catch (error) {
        console.error('Error fixing property ownership:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}
// Run the fix function if this file is executed directly
if (require.main === module) {
    fixPropertyOwnership();
}
exports.default = fixPropertyOwnership;
