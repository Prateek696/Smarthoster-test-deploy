# Property Seeding Instructions

This document explains how to seed the database with the 7 actual properties mentioned in the codebase.

## Properties Included

The seed script will add the following 7 properties:

1. **Piece of Heaven** (ID: 392776, Hostkit: 10027) - Villa, 3BR/2BA, 6 guests
2. **Lote 16 Pt 1 3-B** (ID: 392777, Hostkit: 10030) - Apartment, 3BR/2BA, 6 guests  
3. **Lote 8 4-B** (ID: 392778, Hostkit: 10029) - Apartment, 4BR/3BA, 8 guests
4. **Lote 12 4-A** (ID: 392779, Hostkit: 10028) - Apartment, 4BR/3BA, 8 guests
5. **Lote 16 Pt1 4-B** (ID: 392780, Hostkit: 10032) - Apartment, 4BR/3BA, 8 guests
6. **Lote 7 3-A** (ID: 392781, Hostkit: 10031) - Apartment, 3BR/2BA, 6 guests
7. **Waterfront Pool Penthouse View** (ID: 414661, Hostkit: 12602) - Penthouse, 4BR/3BA, 8 guests

## Prerequisites

1. Make sure your MongoDB connection is configured in the `.env` file
2. Ensure all required environment variables are set, especially the Hostkit API keys for each property
3. Make sure the backend dependencies are installed: `npm install`

## Running the Seed Script

### Option 1: Using npm script (Recommended)
```bash
cd owner-portal/backend
npm run seed:properties
```

### Option 2: Direct execution
```bash
cd owner-portal/backend
npx ts-node src/scripts/seedProperties.ts
```

## What the Script Does

1. **Connects to MongoDB** using the configured connection string
2. **Clears existing properties** (optional - you can modify the script to keep existing data)
3. **Creates a default owner user** if one doesn't exist:
   - Email: `owner@algarveproperties.com`
   - Password: `password123`
   - Role: `owner`
4. **Adds all 7 properties** with their respective Hostkit IDs and API keys
5. **Associates properties with the owner** user
6. **Displays confirmation** of all seeded properties

## Environment Variables Required

Make sure these Hostkit API keys are set in your `.env` file:

```env
HOSTKIT_API_KEY_10027=your_api_key_here
HOSTKIT_API_KEY_10028=your_api_key_here
HOSTKIT_API_KEY_10029=your_api_key_here
HOSTKIT_API_KEY_10030=your_api_key_here
HOSTKIT_API_KEY_10031=your_api_key_here
HOSTKIT_API_KEY_10032=your_api_key_here
HOSTKIT_API_KEY_12602=your_api_key_here
```

## Verification

After running the seed script, you can verify the properties were added by:

1. **Checking the database** directly in MongoDB
2. **Using the API** to fetch properties: `GET /api/property-management`
3. **Checking the dashboard** - it should now show real property data instead of empty states

## Notes

- The script will create a default owner user if one doesn't exist
- All properties are set to "active" status
- Each property includes basic amenities like WiFi, Parking, Kitchen, etc.
- The script uses the Hostkit IDs and API keys from your environment configuration
- Properties are located in "Algarve, Portugal" as the base address

## Troubleshooting

If you encounter issues:

1. **Database connection errors**: Check your MongoDB connection string in `.env`
2. **Missing API keys**: Ensure all Hostkit API keys are properly set
3. **Permission errors**: Make sure the script has write access to the database
4. **TypeScript errors**: Run `npm install` to ensure all dependencies are installed

## Modifying the Script

To customize the properties or add more:

1. Edit the `propertiesData` array in `src/scripts/seedProperties.ts`
2. Add corresponding API keys to your `.env` file
3. Update the environment configuration in `src/config/env.ts` if needed





