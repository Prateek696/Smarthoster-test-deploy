import { env } from "../config/env";
import { getHostkitApiKeyForProperty } from "../services/dynamicApiKey.service";

// Dynamic property mapping - will be fetched from database
const getPropertyToHostkitMapping = async (): Promise<{ [key: number]: string }> => {
  try {
    const PropertyModel = require('../models/property.model').default;
    const properties = await PropertyModel.find({});
    const mapping: { [key: number]: string } = {};
    
    properties.forEach((property: any) => {
      if (property.id && property.hostkitId) {
        mapping[property.id] = property.hostkitId;
      }
    });
    
    return mapping;
  } catch (error) {
    console.error('Error fetching property mapping from database:', error);
    return {};
  }
};

// Get the appropriate Hostkit API key for a specific property
// NEW: Uses dynamic API keys from database instead of hardcoded env variables
export const getHostkitApiKey = async (propertyId: number): Promise<string | null> => {
  try {
    // First try to get API key from database (dynamic)
    const dynamicApiKey = await getHostkitApiKeyForProperty(propertyId);
    if (dynamicApiKey) {
      console.log(`✅ Using dynamic API key for property ${propertyId}`);
      return dynamicApiKey;
    }

    // Fallback to old hardcoded system for backward compatibility
    const hostkitId = PROPERTY_TO_HOSTKIT_MAPPING[propertyId];
    if (hostkitId && env.hostkit.apiKeys && env.hostkit.apiKeys[hostkitId as keyof typeof env.hostkit.apiKeys]) {
      console.log(`⚠️ Using fallback env API key for property ${propertyId}`);
      return env.hostkit.apiKeys[hostkitId as keyof typeof env.hostkit.apiKeys];
    }
    
    // Final fallback to general API key
    if (env.hostkit.apiKey) {
      console.log(`⚠️ Using general env API key for property ${propertyId}`);
      return env.hostkit.apiKey;
    }
    
    console.warn(`❌ No Hostkit API key found for property ${propertyId}`);
    return null;
  } catch (error) {
    console.error(`Error getting API key for property ${propertyId}:`, error);
    return null;
  }
};

// Get Hostkit ID for a property (dynamic from database)
export const getHostkitId = async (propertyId: number): Promise<string | null> => {
  try {
    const PropertyModel = require('../models/property.model').default;
    const property = await PropertyModel.findOne({ id: propertyId });
    return property ? property.hostkitId : null;
  } catch (error) {
    console.error(`Error fetching Hostkit ID for property ${propertyId}:`, error);
    return null;
  }
};

// Check if property has a specific API key configured (dynamic from database)
export const hasPropertySpecificApiKey = async (propertyId: number): Promise<boolean> => {
  try {
    const hostkitId = await getHostkitId(propertyId);
    return !!(hostkitId && env.hostkit.apiKeys[hostkitId as keyof typeof env.hostkit.apiKeys]);
  } catch (error) {
    console.error(`Error checking API key for property ${propertyId}:`, error);
    return false;
  }
};

// Get all configured property IDs (dynamic from database)
export const getConfiguredPropertyIds = async (): Promise<number[]> => {
  try {
    const PropertyModel = require('../models/property.model').default;
    const properties = await PropertyModel.find({});
    return properties
      .filter((property: any) => property.id && property.hostkitId)
      .map((property: any) => property.id);
  } catch (error) {
    console.error('Error fetching configured property IDs:', error);
    return [];
  }
};
