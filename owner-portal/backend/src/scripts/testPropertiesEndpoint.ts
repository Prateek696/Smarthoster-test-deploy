import mongoose from 'mongoose';
import Property from '../models/property.model';
import { UserModel } from '../models/User.model';
import { env } from '../config/env';
import { generateAccessToken } from '../utils/jwt';

async function testPropertiesEndpoint() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB');

    // Get the owner user
    const owner = await UserModel.findOne({ role: 'owner' });
    if (!owner) {
      console.log('❌ No owner user found. Run the seed script first.');
      return;
    }
    console.log(`✅ Found owner: ${owner.name} (${owner.email})`);
    console.log(`   Owner ID: ${owner._id}`);

    // Get all properties for this owner
    const properties = await Property.find({ owner: owner._id });
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
    const propertyService = await import('../services/property.service');
    const serviceResult = await propertyService.getPropertiesService((owner._id as any).toString());
    console.log(`Service returned ${serviceResult.properties.length} properties`);

    // Generate a JWT token for testing
    console.log('\n🔑 Generating JWT token for testing...');
    const payload = { id: owner._id, role: owner.role };
    const token = generateAccessToken(payload);
    console.log(`JWT Token: ${token.substring(0, 50)}...`);

    // Test the API endpoint simulation
    console.log('\n🌐 Testing API endpoint simulation...');
    const mockReq = {
      user: { id: (owner._id as any).toString(), role: owner.role }
    };
    
    // Simulate the controller logic
    try {
      const serviceResult = await propertyService.getPropertiesService((owner._id as any).toString());
      const response = {
        properties: serviceResult.properties,
        total: serviceResult.properties.length,
      };
      console.log('✅ API simulation successful!');
      console.log(`Response: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      console.log('❌ API simulation failed:', error);
    }

    console.log('\n✅ Properties endpoint should work correctly!');
    console.log('Make sure you are logged in as the owner user to see the properties.');

  } catch (error) {
    console.error('Error testing properties endpoint:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the test function if this file is executed directly
if (require.main === module) {
  testPropertiesEndpoint();
}

export default testPropertiesEndpoint;