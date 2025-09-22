// saft.service.ts
import axios from 'axios';
import { env } from '../config/env';
import { getHostkitApiKey, getHostkitId } from '../utils/propertyApiKey';

interface HostkitSAFTResponse {
  generated: string;
  sent: string;
  saft: string;
}

interface SAFTRequest {
  propertyId: string;
  year: number;
  month: number;
  invoicingNif: string;
}

// Note: Property to Hostkit ID mapping is now dynamic from database
// See getHostkitId() function in utils/propertyApiKey.ts

export const getSaftService = async (request: SAFTRequest): Promise<HostkitSAFTResponse> => {
  const { propertyId, year, month, invoicingNif } = request;

  // Use the new dynamic API key system
  const apiKey = await getHostkitApiKey(parseInt(propertyId));
  if (!apiKey) {
    throw new Error(`No Hostkit API key configured for property ${propertyId}`);
  }

  // Get the Hostkit ID for this property (dynamic from database)
  const hostkitId = await getHostkitId(parseInt(propertyId));
  if (!hostkitId) {
    throw new Error(`No Hostkit ID configured for property ${propertyId}`);
  }

  // Validate inputs
  if (!invoicingNif || invoicingNif.length !== 9) {
    throw new Error('Invalid invoicing VAT ID. Must be 9 digits.');
  }

  if (year < 2020 || year > new Date().getFullYear() + 1) {
    throw new Error('Invalid year. Must be between 2020 and next year.');
  }

  if (month < 1 || month > 12) {
    throw new Error('Invalid month. Must be between 1 and 12.');
  }

  try {
    // Call Hostkit API
    const response = await axios.get(`${env.hostkit.apiUrl}/getSAFT`, {
      params: {
        APIKEY: apiKey,
        property_id: hostkitId,
        invoicing_nif: invoicingNif,
        year: year,
        month: month
      },
      timeout: 30000 // 30 second timeout
    });

    if (response.data && response.data.saft) {
  return {
        generated: response.data.generated || new Date().toISOString(),
        sent: response.data.sent || new Date().toISOString(),
        saft: response.data.saft
      };
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
      throw new Error(`SAFT generation failed: ${error.message}`);
    }
  }
};
