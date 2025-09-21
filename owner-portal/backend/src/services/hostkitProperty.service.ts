// hostkitProperty.service.ts
import axios from 'axios';
import { env } from '../config/env';
import { PropertyModel } from '../models/Property.model';

interface HostkitPropertyResponse {
  owner: string;
  activated: string;
  id: string;
  address: string;
  property_name: string;
  cp: string;
  localidade: string;
  nif: string;
  seforder: string;
  sefcode: string;
  lat: string;
  lon: string;
  default_checkin: string;
  default_checkout: string;
  invoicing_nif: string;
}

interface PropertyRequest {
  propertyId: string;
}

export const getPropertyService = async (request: PropertyRequest): Promise<HostkitPropertyResponse> => {
  const { propertyId } = request;
  
  // Fetch property from database to get Hostkit configuration
  const property = await PropertyModel.findOne({ id: parseInt(propertyId) });
  if (!property) {
    throw new Error(`Property ${propertyId} not found in database`);
  }

  // Get Hostkit ID and API key from database
  const hostkitId = property.hostkitId;
  const apiKey = property.hostkitApiKey;

  let finalHostkitId: string;
  let finalApiKey: string;

  // Use database values if available, otherwise fallback to environment variables
  if (hostkitId && apiKey) {
    finalHostkitId = hostkitId;
    finalApiKey = apiKey;
  } else {
    console.warn(`Property ${propertyId} missing Hostkit configuration in database, falling back to environment variables`);
    
    // Fallback to hardcoded mapping for backward compatibility
    const propertyToHostkitMap: { [key: string]: string } = {
      '392776': '10027', // Piece of Heaven
      '392779': '10028', // Lote 12 4-A
      '392778': '10029', // Lote 8 4-B
      '392777': '10030', // Lote 16 Pt 1 3-B
      '392781': '10031', // Lote 7 3-A
      '392780': '10032', // Lote 16 Pt1 4-B
      '414661': '12602', // Waterfront Pool Penthouse View
    };

    const fallbackHostkitId = propertyToHostkitMap[propertyId];
    if (!fallbackHostkitId) {
      throw new Error(`No Hostkit configuration found for property ${propertyId}. Please configure Hostkit ID and API key in the property settings.`);
    }

    const fallbackApiKey = env.hostkit.apiKeys[fallbackHostkitId as keyof typeof env.hostkit.apiKeys];
    if (!fallbackApiKey) {
      throw new Error(`HOSTKIT_API_KEY_${fallbackHostkitId} environment variable is not set for property ${propertyId}`);
    }

    finalHostkitId = fallbackHostkitId;
    finalApiKey = fallbackApiKey;
  }

  // Validate input
  if (!propertyId) {
    throw new Error('Property ID is required');
  }

  try {
    // Call Hostkit API
    const response = await axios.get(`${env.hostkit.apiUrl}/getProperty`, {
      params: {
        APIKEY: finalApiKey,
        id: finalHostkitId
      },
      timeout: 30000 // 30 second timeout
    });

    if (response.data && response.data.id) {
      return response.data;
    } else {
      throw new Error('Invalid response from Hostkit API');
    }
  } catch (error: any) {
    if (error.response) {
      // API returned an error response
      const errorMessage = error.response.data?.message || error.response.data?.error || 'API request failed';
      throw new Error(`Hostkit API Error: ${errorMessage}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to Hostkit API. Please check your internet connection.');
    } else {
      // Something else happened
      throw new Error(`Property retrieval failed: ${error.message}`);
    }
  }
};



