import axios from "axios";
import { getHostkitApiKey } from "../utils/propertyApiKey";

const HOSTKIT_BASE_URL = process.env.HOSTKIT_API_URL as string;
const HOSTAWAY_ACCOUNT_ID = process.env.HOSTAWAY_ACCOUNT_ID as string;

export const getHostkitCreditNotes = async (
  listingId: number,
  startDate?: string,
  endDate?: string,
  status?: string
): Promise<any> => {
  try {
    // Use the property-specific API key mapping (now dynamic from database)
    const propertyApiKey = await getHostkitApiKey(listingId);
    if (!propertyApiKey) {
      throw new Error(`No API key found for property ${listingId}`);
    }

    // Get the Hostkit property ID for this listing
    const { getHostkitId } = require('../utils/propertyApiKey');
    const hostkitPropertyId = await getHostkitId(listingId);
    
    if (!hostkitPropertyId) {
      throw new Error(`No Hostkit ID found for property ${listingId}`);
    }
    
    const params: any = {
      APIKEY: propertyApiKey,
      property_id: hostkitPropertyId,
      account_id: HOSTAWAY_ACCOUNT_ID
    };

    // Add date filters if provided
    if (startDate) {
      const dateStart = Math.floor(new Date(startDate).getTime() / 1000);
      params.date_start = dateStart;
    }
    
    if (endDate) {
      const dateEnd = Math.floor(new Date(endDate).getTime() / 1000);
      params.date_end = dateEnd;
    }

    // Add status filter if provided
    if (status && status !== 'all') {
      params.status = status;
    }

    console.log('Fetching Hostkit credit notes:', {
      propertyId: listingId,
      hostkitId: hostkitPropertyId,
      startDate,
      endDate,
      status,
      apiKey: propertyApiKey ? 'Present' : 'Missing',
      url: `${HOSTKIT_BASE_URL}/getCreditNotes`
    });

    const { data } = await axios.get(`${HOSTKIT_BASE_URL}/getCreditNotes`, {
      params
    });
    
    console.log('Hostkit credit notes response:', data);
    return data || [];
  } catch (error: any) {
    console.error('Error fetching Hostkit credit notes:', error);
    console.error('Error details:', error.response?.data || error.message);
    // Return empty array if API fails
    return [];
  }
};

export const createHostkitCreditNote = async (
  listingId: number,
  invoiceId: string,
  invoiceSeries: string,
  options?: {
    invoicingNif?: string;
  }
): Promise<any> => {
  try {
    // Use the property-specific API key mapping
    const propertyApiKey = await getHostkitApiKey(listingId);
    if (!propertyApiKey) {
      throw new Error(`No API key found for property ${listingId}`);
    }

    // Get the Hostkit property ID for this listing
    const { getHostkitId } = require('../utils/propertyApiKey');
    const hostkitPropertyId = await getHostkitId(listingId);
    
    if (!hostkitPropertyId) {
      throw new Error(`No Hostkit ID found for property ${listingId}`);
    }
    
    // Build parameters according to Hostkit API documentation
    const params: any = {
      APIKEY: propertyApiKey,
      refid: invoiceId, // Mandatory: Reference to existing closed invoice
      refseries: invoiceSeries // Mandatory: Reference to invoice series
    };

    // Add optional parameters if provided
    if (options?.invoicingNif) {
      params.invoicing_nif = options.invoicingNif;
    }

    console.log('Creating Hostkit credit note:', {
      propertyId: listingId,
      hostkitId: hostkitPropertyId,
      invoiceId,
      invoiceSeries,
      options,
      apiKey: propertyApiKey ? 'Present' : 'Missing',
      url: `${HOSTKIT_BASE_URL}/addCreditNote`
    });

    const { data } = await axios.get(`${HOSTKIT_BASE_URL}/addCreditNote`, {
      params
    });
    
    return data;
  } catch (error: any) {
    console.error('Error creating Hostkit credit note:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw new Error(`Failed to create credit note: ${error.message}`);
  }
};

export const getHostkitInvoices = async (
  listingId: number,
  startDate: string,
  endDate: string
): Promise<any> => {
  try {
    const dateStart = Math.floor(new Date(startDate).getTime() / 1000);
    const dateEnd = Math.floor(new Date(endDate).getTime() / 1000);

    // Use the property-specific API key mapping (same as other services)
    const propertyApiKey = await getHostkitApiKey(listingId);
    if (!propertyApiKey) {
      throw new Error(`No API key found for property ${listingId}`);
    }

    // Get the Hostkit property ID for this listing
    const { getHostkitId } = require('../utils/propertyApiKey');
    const hostkitPropertyId = await getHostkitId(listingId);
    
    if (!hostkitPropertyId) {
      throw new Error(`No Hostkit ID found for property ${listingId}`);
    }
    
    const params: any = {
      APIKEY: propertyApiKey,        // Use property-specific API key
      property_id: hostkitPropertyId, // Use Hostkit ID instead of Hostaway ID
      date_start: dateStart,
      date_end: dateEnd,
      account_id: HOSTAWAY_ACCOUNT_ID  // Always include like other endpoints
    };

    console.log('Fetching Hostkit invoices:', {
      propertyId: listingId,
      hostkitId: hostkitPropertyId,
      apiKey: propertyApiKey ? 'Present' : 'Missing',
      url: `${HOSTKIT_BASE_URL}/getInvoices`,
      params: params,
      dateRange: `${new Date(Number(dateStart) * 1000).toISOString().split('T')[0]} to ${new Date(Number(dateEnd) * 1000).toISOString().split('T')[0]}`
    });

    const { data } = await axios.get(`${HOSTKIT_BASE_URL}/getInvoices`, {
      params
    });
    
    console.log(`[HOSTKIT DEBUG] Raw response for property ${listingId}:`, {
      dataType: Array.isArray(data) ? 'Array' : typeof data,
      count: Array.isArray(data) ? data.length : 'N/A',
      sampleData: Array.isArray(data) && data.length > 0 ? data[0] : 'No data',
      requestedPropertyId: listingId,
      hostkitPropertyId: hostkitPropertyId
    });
    
    return data;
  } catch (error: any) {
    console.error("Error fetching Hostkit invoices:", {
      error: error.message,
      response: error.response?.data,
      listingId,
      hostkitId: require('../utils/propertyApiKey').getHostkitId(listingId)
    });
    throw error;
  }
};

export const updateHostkitCalendar = async (
  listingId: number,
  startDate: string,
  endDate: string,
  status: "blocked" | "available"
): Promise<any> => {
  try {
    // Debug environment variables
    console.log('Hostkit API Debug:', {
      HOSTKIT_BASE_URL,
      HOSTAWAY_ACCOUNT_ID: HOSTAWAY_ACCOUNT_ID ? 'Present' : 'Missing'
    });

    if (!HOSTKIT_BASE_URL) {
      throw new Error("HOSTKIT_API_URL environment variable is not set");
    }

    if (!HOSTKIT_BASE_URL.startsWith('https://')) {
      throw new Error(`HOSTKIT_API_URL must start with https://, got: ${HOSTKIT_BASE_URL}`);
    }

    const dateStart = Math.floor(new Date(startDate).getTime() / 1000);
    const dateEnd = Math.floor(new Date(endDate).getTime() / 1000);

    // Use the property-specific API key mapping (same as other services)
    const apiKey = await getHostkitApiKey(listingId);
    if (!apiKey) {
      throw new Error(`No API key found for property ${listingId}`);
    }

    // Get the Hostkit property ID for this listing
    const { getHostkitId } = require('../utils/propertyApiKey');
    const hostkitPropertyId = await getHostkitId(listingId);
    if (!hostkitPropertyId) {
      throw new Error(`No Hostkit ID mapping found for property ${listingId}`);
    }

    console.log(`Updating Hostkit calendar:`, {
      url: `${HOSTKIT_BASE_URL}/updateCalendar`,
      propertyId: listingId,
      hostkitId: hostkitPropertyId,
      apiKey: apiKey ? 'Present' : 'Missing',
      params: {
        listing_id: hostkitPropertyId, // Use Hostkit ID, not Hostaway ID
        date_start: dateStart,
        date_end: dateEnd,
        status
      }
    });

    const { data } = await axios.get(`${HOSTKIT_BASE_URL}/updateCalendar`, {
      params: {
        APIKEY: apiKey,
        listing_id: hostkitPropertyId, // Use Hostkit ID, not Hostaway ID
        date_start: dateStart,
        date_end: dateEnd,
        status
      }
    });
    return data;
  } catch (error: any) {
    console.error("Error updating Hostkit calendar:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: HOSTKIT_BASE_URL,
      listingId,
      hostkitId: require('../utils/propertyApiKey').getHostkitId(listingId)
    });
    throw error;
  }
};

export const getChannelBookings = async (propertyId: number, startDate: string, endDate: string) => {
  try {
    const dateStart = Math.floor(new Date(startDate).getTime() / 1000);
    const dateEnd = Math.floor(new Date(endDate).getTime() / 1000);

    // Use the property-specific API key mapping (same as other services)
    const apiKey = await getHostkitApiKey(propertyId);
    if (!apiKey) {
      throw new Error(`No API key found for property ${propertyId}`);
    }

    // Get the Hostkit property ID for this listing
    const { getHostkitId } = require('../utils/propertyApiKey');
    const hostkitPropertyId = await getHostkitId(propertyId);
    if (!hostkitPropertyId) {
      throw new Error(`No Hostkit ID found for property ${propertyId}`);
    }

    console.log('Fetching Hostkit bookings:', {
      propertyId,
      hostkitId: hostkitPropertyId,
      apiKey: apiKey ? 'Present' : 'Missing',
      url: `${HOSTKIT_BASE_URL}/getBookings`
    });

    const { data } = await axios.get(`${HOSTKIT_BASE_URL}/getBookings`, {
      params: {
        APIKEY: apiKey,
        account_id: HOSTAWAY_ACCOUNT_ID,
        property_id: hostkitPropertyId, // Use Hostkit ID, not Hostaway ID
        date_start: dateStart,
        date_end: dateEnd
      }
    });
    
    return Array.isArray(data) ? data : data.bookings || [];
  } catch (error: any) {
    console.error('Error fetching bookings from Hostkit:', {
      error: error.message,
      response: error.response?.data,
      propertyId,
      hostkitId: require('../utils/propertyApiKey').getHostkitId(propertyId)
    });
    throw error;
  }
};

// SIBA (Municipal Tax) API Functions - Using Hostkit API
export const validateHostkitSiba = async (
  listingId: number,
  reservationCode: string
): Promise<any> => {
  try {
    const propertyApiKey = await getHostkitApiKey(listingId);
    if (!propertyApiKey) {
      throw new Error(`No API key found for property ${listingId}`);
    }

    const params = {
      APIKEY: propertyApiKey,
      rcode: reservationCode
    };

    console.log('Validating SIBA with Hostkit:', {
      listingId,
      reservationCode,
      params: { ...params, APIKEY: '[HIDDEN]' }
    });

    const response = await axios.get(`${HOSTKIT_BASE_URL}/validateSIBA`, { params });
    
    console.log('Hostkit SIBA validation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error validating SIBA with Hostkit:', error.response?.data || error.message);
    throw error;
  }
};

export const sendHostkitSiba = async (
  listingId: number,
  reservationCode: string
): Promise<any> => {
  try {
    const propertyApiKey = await getHostkitApiKey(listingId);
    if (!propertyApiKey) {
      throw new Error(`No API key found for property ${listingId}`);
    }

    const params = {
      APIKEY: propertyApiKey,
      rcode: reservationCode
    };

    console.log('Sending SIBA to Hostkit:', {
      listingId,
      reservationCode,
      params: { ...params, APIKEY: '[HIDDEN]' }
    });

    const response = await axios.get(`${HOSTKIT_BASE_URL}/sendSIBA`, { params });
    
    console.log('Hostkit SIBA send response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error sending SIBA to Hostkit:', error.response?.data || error.message);
    throw error;
  }
};

export const getLastHostkitSibaDate = async (
  listingId: number
): Promise<any> => {
  try {
    const propertyApiKey = await getHostkitApiKey(listingId);
    if (!propertyApiKey) {
      throw new Error(`No API key found for property ${listingId}`);
    }

    const params = {
      APIKEY: propertyApiKey
    };

    console.log('Getting last SIBA date from Hostkit:', {
      listingId,
      params: { ...params, APIKEY: '[HIDDEN]' }
    });

    const response = await axios.get(`${HOSTKIT_BASE_URL}/getLastSIBADate`, { params });
    
    console.log('Hostkit last SIBA date response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error getting last SIBA date from Hostkit:', error.response?.data || error.message);
    throw error;
  }
};

export const getHostkitReservation = async (
  listingId: number,
  reservationCode: string
): Promise<any> => {
  try {
    const propertyApiKey = await getHostkitApiKey(listingId);
    if (!propertyApiKey) {
      throw new Error(`No API key found for property ${listingId}`);
    }

    const params = {
      APIKEY: propertyApiKey,
      rcode: reservationCode
    };

    console.log('Getting reservation from Hostkit:', {
      listingId,
      reservationCode,
      params: { ...params, APIKEY: '[HIDDEN]' }
    });

    const response = await axios.get(`${HOSTKIT_BASE_URL}/getReservation`, { params });
    
    console.log('Hostkit reservation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error getting reservation from Hostkit:', error.response?.data || error.message);
    throw error;
  }
};

export const getHostkitReservations = async (
  listingId: number,
  startDate: string,
  endDate: string
): Promise<any> => {
  try {
    const dateStart = Math.floor(new Date(startDate).getTime() / 1000);
    const dateEnd = Math.floor(new Date(endDate).getTime() / 1000);

    // Use the property-specific API key mapping (same as other services)
    const propertyApiKey = await getHostkitApiKey(listingId);
    if (!propertyApiKey) {
      throw new Error(`No API key found for property ${listingId}`);
    }

    // Get the Hostkit property ID for this listing
    const { getHostkitId } = require('../utils/propertyApiKey');
    const hostkitPropertyId = await getHostkitId(listingId);
    if (!hostkitPropertyId) {
      throw new Error(`No Hostkit ID found for property ${listingId}`);
    }

    const params = {
      APIKEY: propertyApiKey,        // Use property-specific API key
      account_id: HOSTAWAY_ACCOUNT_ID,
      property_id: hostkitPropertyId,  // Use Hostkit ID, not Hostaway ID
      date_start: dateStart,
      date_end: dateEnd
    };

    console.log('Fetching Hostkit reservations:', {
      propertyId: listingId,
      hostkitId: hostkitPropertyId,
      apiKey: propertyApiKey ? 'Present' : 'Missing',
      url: `${HOSTKIT_BASE_URL}/getReservations`
    });
    
    const { data } = await axios.get(`${HOSTKIT_BASE_URL}/getReservations`, { params });
    return data;
  } catch (error: any) {
    console.error("Error fetching Hostkit reservations:", {
      error: error.message,
      response: error.response?.data,
      listingId,
      hostkitId: require('../utils/propertyApiKey').getHostkitId(listingId)
    });
    throw error;
  }
};

export const getHostkitTouristTax = async (
  propertyId: number,
  startDate: string,
  endDate: string
): Promise<number> => {
  try {
    const dateStart = Math.floor(new Date(startDate).getTime() / 1000);
    const dateEnd = Math.floor(new Date(endDate).getTime() / 1000);

    // Use the property-specific API key mapping (same as other services)
    const apiKey = await getHostkitApiKey(propertyId);
    if (!apiKey) {
      throw new Error(`No API key found for property ${propertyId}`);
    }

    // Get the Hostkit property ID for this listing
    const { getHostkitId } = require('../utils/propertyApiKey');
    const hostkitPropertyId = await getHostkitId(propertyId);
    if (!hostkitPropertyId) {
      throw new Error(`No Hostkit ID found for property ${propertyId}`);
    }

    console.log('Fetching Hostkit tourist tax:', {
      propertyId,
      hostkitId: hostkitPropertyId,
      apiKey: apiKey ? 'Present' : 'Missing',
      url: `${HOSTKIT_BASE_URL}/getTouristTax`
    });

    const { data } = await axios.get(`${HOSTKIT_BASE_URL}/getTouristTax`, {
      params: {
        APIKEY: apiKey,
        account_id: HOSTAWAY_ACCOUNT_ID,
        property_id: hostkitPropertyId, // Use Hostkit ID, not Hostaway ID
        date_start: dateStart,
        date_end: dateEnd
      }
    });
    
    return data.totalTax || 0;
  } catch (error: any) {
    console.error("Error fetching Hostkit tourist tax:", {
      error: error.message,
      response: error.response?.data,
      propertyId,
      hostkitId: require('../utils/propertyApiKey').getHostkitId(propertyId)
    });
    return 0; // Return 0 if API fails
  }
};

// SAFT Generation Functions
export const generateHostkitSaft = async (
  propertyId: number,
  year: number,
  month: number
): Promise<any> => {
  try {
    console.log('Generating Hostkit SAFT:', { propertyId, year, month });

    if (!HOSTKIT_BASE_URL) {
      throw new Error("HOSTKIT_API_URL environment variable is not set");
    }

    // Use the property-specific API key mapping
    const apiKey = await getHostkitApiKey(propertyId);
    if (!apiKey) {
      throw new Error(`No API key found for property ${propertyId}`);
    }

    // Get the Hostkit property ID for this listing
    const { getHostkitId } = require('../utils/propertyApiKey');
    const hostkitPropertyId = await getHostkitId(propertyId);
    if (!hostkitPropertyId) {
      throw new Error(`No Hostkit ID mapping found for property ${propertyId}`);
    }

    // Get invoicing NIF from property configuration
    // For now, using a default NIF - this should be configurable per property
    const invoicingNif = '234567890'; // This should come from property configuration

    console.log(`Generating SAFT:`, {
      url: `${HOSTKIT_BASE_URL}/generateSAFT`,
      propertyId,
      hostkitId: hostkitPropertyId,
      apiKey: apiKey ? 'Present' : 'Missing',
      params: {
        APIKEY: apiKey,
        invoicing_nif: invoicingNif,
        year,
        month
      }
    });

    const { data } = await axios.get(`${HOSTKIT_BASE_URL}/generateSAFT`, {
      params: {
        APIKEY: apiKey,
        invoicing_nif: invoicingNif,
        year,
        month,
        cae: '55201' // CAE code for short-term accommodation (hotels, guesthouses, etc.)
      }
    });

    console.log('SAFT generation response:', data);
    
    // Wait a moment for the SAFT to be generated
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return data;
  } catch (error: any) {
    console.error('Error generating SAFT:', {
      error: error.message,
      response: error.response?.data,
      propertyId,
      year,
      month
    });
    throw error;
  }
};

export const getHostkitSaft = async (
  propertyId: number,
  year: number,
  month: number
): Promise<any> => {
  try {
    console.log('Getting Hostkit SAFT:', { propertyId, year, month });

    if (!HOSTKIT_BASE_URL) {
      throw new Error("HOSTKIT_API_URL environment variable is not set");
    }

    // Use the property-specific API key mapping
    const apiKey = await getHostkitApiKey(propertyId);
    if (!apiKey) {
      throw new Error(`No API key found for property ${propertyId}`);
    }

    // Get the Hostkit property ID for this listing
    const { getHostkitId } = require('../utils/propertyApiKey');
    const hostkitPropertyId = await getHostkitId(propertyId);
    if (!hostkitPropertyId) {
      throw new Error(`No Hostkit ID mapping found for property ${propertyId}`);
    }

    // Get invoicing NIF from property configuration
    const invoicingNif = '234567890'; // This should come from property configuration

    console.log(`Getting SAFT:`, {
      url: `${HOSTKIT_BASE_URL}/getSAFT`,
      propertyId,
      hostkitId: hostkitPropertyId,
      apiKey: apiKey ? 'Present' : 'Missing',
      params: {
        APIKEY: apiKey,
        invoicing_nif: invoicingNif,
        year,
        month
      }
    });

    const { data } = await axios.get(`${HOSTKIT_BASE_URL}/getSAFT`, {
      params: {
        APIKEY: apiKey,
        invoicing_nif: invoicingNif,
        year,
        month,
        cae: '55201' // CAE code for short-term accommodation (hotels, guesthouses, etc.)
      }
    });

    console.log('SAFT retrieval response:', {
      generated: data.generated,
      sent: data.sent,
      hasSaft: !!data.saft,
      saftLength: data.saft ? data.saft.length : 0
    });
    
    return data;
  } catch (error: any) {
    console.error('Error getting SAFT:', {
      error: error.message,
      response: error.response?.data,
      propertyId,
      year,
      month
    });
    throw error;
  }
};
