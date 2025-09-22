import mongoose from 'mongoose';
import Property from '../models/property.model';
import { UserModel } from '../models/User.model';
import { env } from '../config/env';

async function fixPropertyOwnership() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB');

    // Get your actual user (the one you're logged in as)
    const actualUser = await UserModel.findOne({ email: 'krprateek758@gmail.com' });
    if (!actualUser) {
      console.log('❌ Your user not found. Make sure you are logged in.');
      return;
    }
    console.log(`✅ Found your user: ${(actualUser as any).firstName || actualUser.name} (${actualUser.email})`);
    console.log(`   Your User ID: ${actualUser._id}`);

    // Get all properties (regardless of owner)
    const allProperties = await Property.find({});
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
      console.log(`   Match: ${property.owner.toString() === (actualUser._id as any).toString() ? '✅' : '❌'}`);
    });

    // Update all properties to be owned by your user
    console.log('\n🔧 Updating property ownership...');
    const updateResult = await Property.updateMany(
      {}, // Update all properties
      { owner: actualUser._id }
    );
    
    console.log(`✅ Updated ${updateResult.modifiedCount} properties to be owned by you`);

    // Verify the update
    console.log('\n🔍 Verifying ownership update...');
    const yourProperties = await Property.find({ owner: actualUser._id });
    console.log(`✅ You now own ${yourProperties.length} properties:`);
    
    yourProperties.forEach((property, index) => {
      console.log(`${index + 1}. ${property.name} (ID: ${property.id})`);
      console.log(`   Type: ${property.type}, Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}`);
    });

    console.log('\n🎉 Property ownership fixed!');
    console.log('Now refresh your dashboard and you should see all the properties.');

  } catch (error) {
    console.error('Error fixing property ownership:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the fix function if this file is executed directly
if (require.main === module) {
  fixPropertyOwnership();
}

export default fixPropertyOwnership;
