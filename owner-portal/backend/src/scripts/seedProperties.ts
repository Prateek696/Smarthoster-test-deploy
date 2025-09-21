import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Property, { IProperty } from '../models/property.model';
import { UserModel } from '../models/User.model';
import { env } from '../config/env';

// Property data based on the environment configuration
const propertiesData: Partial<IProperty>[] = [
  {
    id: 392776,
    name: "Piece of Heaven",
    address: "Algarve, Portugal",
    type: "Villa",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    hostkitId: "10027",
    hostkitApiKey: env.hostkit.apiKeys["10027"],
    status: "active",
    images: [],
    amenities: ["Pool", "WiFi", "Parking", "Kitchen", "Air Conditioning", "Garden"]
  },
  {
    id: 392777,
    name: "Lote 16 Pt 1 3-B",
    address: "Algarve, Portugal",
    type: "Apartment",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    hostkitId: "10030",
    hostkitApiKey: env.hostkit.apiKeys["10030"],
    status: "active",
    images: [],
    amenities: ["WiFi", "Parking", "Kitchen", "Air Conditioning", "Balcony"]
  },
  {
    id: 392778,
    name: "Lote 8 4-B",
    address: "Algarve, Portugal",
    type: "Apartment",
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    hostkitId: "10029",
    hostkitApiKey: env.hostkit.apiKeys["10029"],
    status: "active",
    images: [],
    amenities: ["WiFi", "Parking", "Kitchen", "Air Conditioning", "Balcony", "Pool Access"]
  },
  {
    id: 392779,
    name: "Lote 12 4-A",
    address: "Algarve, Portugal",
    type: "Apartment",
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    hostkitId: "10028",
    hostkitApiKey: env.hostkit.apiKeys["10028"],
    status: "active",
    images: [],
    amenities: ["WiFi", "Parking", "Kitchen", "Air Conditioning", "Balcony", "Pool Access"]
  },
  {
    id: 392780,
    name: "Lote 16 Pt1 4-B",
    address: "Algarve, Portugal",
    type: "Apartment",
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    hostkitId: "10032",
    hostkitApiKey: env.hostkit.apiKeys["10032"],
    status: "active",
    images: [],
    amenities: ["WiFi", "Parking", "Kitchen", "Air Conditioning", "Balcony", "Pool Access"]
  },
  {
    id: 392781,
    name: "Lote 7 3-A",
    address: "Algarve, Portugal",
    type: "Apartment",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    hostkitId: "10031",
    hostkitApiKey: env.hostkit.apiKeys["10031"],
    status: "active",
    images: [],
    amenities: ["WiFi", "Parking", "Kitchen", "Air Conditioning", "Balcony"]
  },
  {
    id: 414661,
    name: "Waterfront Pool Penthouse View",
    address: "Algarve, Portugal",
    type: "Penthouse",
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    hostkitId: "12602",
    hostkitApiKey: env.hostkit.apiKeys["12602"],
    status: "active",
    images: [],
    amenities: ["Pool", "WiFi", "Parking", "Kitchen", "Air Conditioning", "Waterfront View", "Penthouse"]
  }
];

async function seedProperties() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - remove this if you want to keep existing data)
    await Property.deleteMany({});
    console.log('Cleared existing properties');

    // Create or find a default owner user
    let owner = await UserModel.findOne({ email: 'owner@algarveproperties.com' });
    if (!owner) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      owner = new UserModel({
        name: 'Property Owner',
        email: 'owner@algarveproperties.com',
        password: hashedPassword,
        role: 'owner'
      });
      await owner.save();
      console.log('Created default owner user');
    } else {
      console.log('Found existing owner user');
    }

    // Insert properties
    const properties = await Property.insertMany(
      propertiesData.map(property => ({
        ...property,
        owner: owner!._id
      }))
    );

    console.log(`Successfully seeded ${properties.length} properties:`);
    properties.forEach(property => {
      console.log(`- ${property.name} (ID: ${property.id}, Hostkit: ${property.hostkitId})`);
    });

    console.log('Property seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding properties:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedProperties();
}

export default seedProperties;
