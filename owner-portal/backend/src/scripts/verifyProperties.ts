import mongoose from 'mongoose';
import Property from '../models/property.model';
import { UserModel } from '../models/User.model';
import { env } from '../config/env';

async function verifyProperties() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB');

    // Check if owner user exists
    const owner = await UserModel.findOne({ role: 'owner' });
    if (!owner) {
      console.log('❌ No owner user found');
      return;
    }
    console.log(`✅ Found owner user: ${owner.name} (${owner.email})`);

    // Get all properties
    const properties = await Property.find({ owner: owner._id });
    console.log(`\n📊 Found ${properties.length} properties:`);
    
    if (properties.length === 0) {
      console.log('❌ No properties found. Run the seed script first: npm run seed:properties');
      return;
    }

    // Display properties
    properties.forEach((property, index) => {
      console.log(`\n${index + 1}. ${property.name}`);
      console.log(`   ID: ${property.id}`);
      console.log(`   Hostkit ID: ${property.hostkitId}`);
      console.log(`   Type: ${property.type}`);
      console.log(`   Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}`);
      console.log(`   Max Guests: ${property.maxGuests}`);
      console.log(`   Status: ${property.status}`);
      console.log(`   Address: ${property.address}`);
      console.log(`   Amenities: ${property.amenities.join(', ')}`);
    });

    // Check for expected properties
    const expectedIds = [392776, 392777, 392778, 392779, 392780, 392781, 414661];
    const foundIds = properties.map(p => p.id);
    const missingIds = expectedIds.filter(id => !foundIds.includes(id));
    const extraIds = foundIds.filter(id => !expectedIds.includes(id));

    console.log('\n🔍 Verification Results:');
    if (missingIds.length === 0 && extraIds.length === 0) {
      console.log('✅ All expected properties are present and no unexpected properties found');
    } else {
      if (missingIds.length > 0) {
        console.log(`❌ Missing properties with IDs: ${missingIds.join(', ')}`);
      }
      if (extraIds.length > 0) {
        console.log(`⚠️  Extra properties with IDs: ${extraIds.join(', ')}`);
      }
    }

    // Check Hostkit API keys
    console.log('\n🔑 Hostkit API Keys Status:');
    properties.forEach(property => {
      const hasApiKey = property.hostkitApiKey && property.hostkitApiKey.length > 0;
      console.log(`${hasApiKey ? '✅' : '❌'} ${property.name} (${property.hostkitId}): ${hasApiKey ? 'API key present' : 'No API key'}`);
    });

  } catch (error) {
    console.error('Error verifying properties:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the verification function if this file is executed directly
if (require.main === module) {
  verifyProperties();
}

export default verifyProperties;
