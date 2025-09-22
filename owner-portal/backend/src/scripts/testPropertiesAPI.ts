import mongoose from 'mongoose';
import Property from '../models/property.model';
import { UserModel } from '../models/User.model';
import { env } from '../config/env';

async function testPropertiesAPI() {
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

    // Get all properties for this owner
    const properties = await Property.find({ owner: owner._id });
    console.log(`\n📊 Found ${properties.length} properties:`);
    
    if (properties.length === 0) {
      console.log('❌ No properties found. Run the seed script first: npm run seed:properties');
      return;
    }

    // Display properties in the format expected by the frontend
    const propertiesForAPI = properties.map(property => ({
      _id: property._id,
      id: property.id,
      name: property.name,
      address: property.address,
      type: property.type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      maxGuests: property.maxGuests,
      hostkitId: property.hostkitId,
      status: property.status,
      images: property.images,
      amenities: property.amenities,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
    }));

    console.log('\n🔍 Properties formatted for API:');
    console.log(JSON.stringify(propertiesForAPI, null, 2));

    // Test the API endpoint format
    const apiResponse = {
      properties: propertiesForAPI,
      total: propertiesForAPI.length
    };

    console.log('\n📡 API Response format:');
    console.log(JSON.stringify(apiResponse, null, 2));

    console.log('\n✅ Properties are ready for the frontend!');
    console.log('The dashboard should now display these properties.');

  } catch (error) {
    console.error('Error testing properties API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the test function if this file is executed directly
if (require.main === module) {
  testPropertiesAPI();
}

export default testPropertiesAPI;





