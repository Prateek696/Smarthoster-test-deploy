import OwnerApiKeysModel from '../models/OwnerApiKeys.model';
import PropertyModel from '../models/property.model';

/**
 * Get Hostkit API key for a specific property
 * This replaces the hardcoded environment variable approach
 */
export const getHostkitApiKeyForProperty = async (propertyId: number): Promise<string | null> => {
  try {
    // Find the property and get its API key directly
    const property = await PropertyModel.findOne({ id: propertyId });
    if (!property) {
      console.warn(`Property ${propertyId} not found`);
      return null;
    }

    // Check if property has its own API key
    if (property.hostkitApiKey) {
      console.log(`✅ Using property's own API key for property ${propertyId}`);
      return property.hostkitApiKey;
    }

    // Fallback: Get the owner's API keys
    const apiKeys = await OwnerApiKeysModel.findOne({ 
      ownerId: property.owner.toString(),
      isActive: true 
    });

    if (!apiKeys) {
      console.warn(`No active API keys found for owner ${property.owner}`);
      return null;
    }

    return apiKeys.hostkitApiKey;
  } catch (error) {
    console.error(`Error getting API key for property ${propertyId}:`, error);
    return null;
  }
};

/**
 * Get Hostkit API secret for a specific property
 */
export const getHostkitApiSecretForProperty = async (propertyId: number): Promise<string | null> => {
  try {
    // Find the property to get its owner
    const property = await PropertyModel.findOne({ id: propertyId });
    if (!property) {
      console.warn(`Property ${propertyId} not found`);
      return null;
    }

    // Get the owner's API keys
    const apiKeys = await OwnerApiKeysModel.findOne({ 
      ownerId: property.owner.toString(),
      isActive: true 
    });

    if (!apiKeys) {
      console.warn(`No active API keys found for owner ${property.owner}`);
      return null;
    }

    return apiKeys.hostkitApiSecret;
  } catch (error) {
    console.error(`Error getting API secret for property ${propertyId}:`, error);
    return null;
  }
};

/**
 * Get all API keys for an owner
 */
export const getOwnerApiKeys = async (ownerId: string) => {
  try {
    const apiKeys = await OwnerApiKeysModel.findOne({ 
      ownerId,
      isActive: true 
    });

    return apiKeys ? {
      hostkitApiKey: apiKeys.hostkitApiKey,
      hostkitApiSecret: apiKeys.hostkitApiSecret,
      isActive: apiKeys.isActive
    } : null;
  } catch (error) {
    console.error(`Error getting API keys for owner ${ownerId}:`, error);
    return null;
  }
};

/**
 * Check if a property has valid API keys
 */
export const hasValidApiKeys = async (propertyId: number): Promise<boolean> => {
  const apiKey = await getHostkitApiKeyForProperty(propertyId);
  const apiSecret = await getHostkitApiSecretForProperty(propertyId);
  return !!(apiKey && apiSecret);
};
