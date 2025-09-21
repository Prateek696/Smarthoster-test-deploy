import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const HOSTAWAY_TOKEN = process.env.HOSTAWAY_TOKEN as string;
const HOSTAWAY_BASE_URL = process.env.HOSTAWAY_API_BASE || "https://api.hostaway.com/v1";

export const getHostawayCreditNotes = async (
  listingId: number,
  status?: string
): Promise<any> => {
  try {
    const params: any = {};
    if (status && status !== 'all') {
      params.status = status;
    }

    console.log('Fetching Hostaway credit notes:', {
      listingId,
      status,
      url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/creditNotes`
    });

    const { data } = await axios.get(
      `${HOSTAWAY_BASE_URL}/listings/${listingId}/creditNotes`,
      {
        headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` },
        params
      }
    );
    
    return data.data || [];
  } catch (error: any) {
    console.error('Error fetching Hostaway credit notes:', error.response?.data || error.message);
    // Return empty array if API fails
    return [];
  }
};

export const createHostawayCreditNote = async (
  listingId: number,
  creditNoteData: any
): Promise<any> => {
  try {
    console.log('Creating Hostaway credit note:', {
      listingId,
      action: creditNoteData.action || 'create',
      url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/creditNotes`
    });

    const { data } = await axios.post(
      `${HOSTAWAY_BASE_URL}/listings/${listingId}/creditNotes`,
      creditNoteData,
      {
        headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` }
      }
    );
    
    return data.data;
  } catch (error: any) {
    console.error('Error creating Hostaway credit note:', error.response?.data || error.message);
    throw new Error(`Failed to create credit note: ${error.message}`);
  }
};

export const getHostawayCalendar = async (
  listingId: number,
  startDate: string,
  endDate: string
): Promise<any> => {
  try {
    console.log('Fetching Hostaway calendar with pricing:', {
      listingId,
      startDate,
      endDate,
      url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
    });

    const { data } = await axios.get(
      `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`,
      {
        headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` },
        params: { 
          startDate, 
          endDate
        }
      }
    );
    
    console.log('Hostaway calendar response:', data);
    return data;
  } catch (error: any) {
    console.error("Error fetching Hostaway calendar:", error.response?.data || error.message);
    throw error;
  }
};

// Get calendar data with pricing and minimum nights for a specific date
export const getHostawayCalendarDate = async (
  listingId: number,
  date: string
): Promise<any> => {
  try {
    console.log('Fetching Hostaway calendar data for date:', {
      listingId,
      date,
      url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
    });

    const { data } = await axios.get(
      `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`,
      {
        headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` },
        params: { 
          startDate: date, 
          endDate: date
        }
      }
    );
    
    console.log('Hostaway calendar date response:', data);
    return data;
  } catch (error: any) {
    console.error('Error fetching Hostaway calendar date:', error.response?.data || error.message);
    throw error;
  }
};

// Get calendar data for a full month with pricing and minimum stay
export const getHostawayCalendarMonth = async (
  listingId: number,
  year: number,
  month: number
): Promise<any> => {
  try {
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
    
    console.log('Fetching Hostaway calendar month with pricing:', {
      listingId,
      year,
      month,
      startDate,
      endDate,
      url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
    });

    const { data } = await axios.get(
      `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`,
      {
        headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` },
        params: { 
          startDate, 
          endDate
        }
      }
    );
    
    console.log('Hostaway calendar month response:', data);
    return data;
  } catch (error: any) {
    console.error('Error fetching Hostaway calendar month:', error.response?.data || error.message);
    throw error;
  }
};

export const updateHostawayCalendar = async (
  listingId: number,
  startDate: string,
  endDate: string,
  status: "blocked" | "available"
): Promise<any> => {
  try {
    // Check if token is available
    if (!HOSTAWAY_TOKEN) {
      throw new Error("HOSTAWAY_TOKEN environment variable is not set");
    }
    
    console.log(`Updating Hostaway calendar for listing ${listingId}:`, {
      startDate,
      endDate,
      status,
      token: HOSTAWAY_TOKEN ? 'Present' : 'Missing'
    });
    
    // Try the correct Hostaway API endpoint for calendar updates
    // The endpoint might be different based on Hostaway API version
    const payload = { 
      startDate, 
      endDate, 
      status: status === 'blocked' ? 'unavailable' : 'available',
      reason: status === 'blocked' ? 'Owner blocked' : 'Available for booking'
    };
    
    console.log('Hostaway API payload:', payload);
    
    const { data } = await axios.put(
      `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`,
      payload,
      { headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` } }
    );
    
    console.log('Hostaway calendar update response:', data);
    return data;
  } catch (error: any) {
    console.error("Error updating Hostaway calendar:", {
      error: error.message,
      response: error.response?.data,
      httpStatus: error.response?.status,
      listingId,
      startDate,
      endDate,
      status
    });
    throw error;
  }
};

export const getHostawayReservations = async (
  listingId: number,
  dateStart: string,
  dateEnd: string
): Promise<any> => {
  try {
    const { data } = await axios.get(
      `${HOSTAWAY_BASE_URL}/reservations`,
      {
        headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` },
        params: { listingId, dateStart, dateEnd }
      }
    );
    return data;
  } catch (error: any) {
    console.error("Error fetching Hostaway reservations:", error.response?.data || error.message);
    throw error;
  }
};

// Update pricing for specific dates
export const updateHostawayPricing = async (
  listingId: number,
  startDate: string,
  endDate: string,
  price: number
): Promise<any> => {
  try {
    if (!HOSTAWAY_TOKEN) {
      throw new Error("HOSTAWAY_TOKEN environment variable is not set");
    }

    console.log('Updating Hostaway pricing:', {
      listingId,
      startDate,
      endDate,
      price,
      url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
    });

    const payload = {
      startDate,
      endDate,
      price
    };

    const { data } = await axios.put(
      `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`,
      payload,
      {
        headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` }
      }
    );
    
    return data;
  } catch (error: any) {
    console.error('Error updating Hostaway pricing:', error.response?.data || error.message);
    throw error;
  }
};

// Update minimum stay rules for specific dates
export const updateHostawayMinimumStay = async (
  listingId: number,
  startDate: string,
  endDate: string,
  minimumStay: number
): Promise<any> => {
  try {
    if (!HOSTAWAY_TOKEN) {
      throw new Error("HOSTAWAY_TOKEN environment variable is not set");
    }

    console.log('Updating Hostaway minimum stay:', {
      listingId,
      startDate,
      endDate,
      minimumStay,
      url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
    });

    const payload = {
      startDate,
      endDate,
      minimumStay
    };

    const { data } = await axios.put(
      `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`,
      payload,
      {
        headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` }
      }
    );
    
    return data;
  } catch (error: any) {
    console.error('Error updating Hostaway minimum stay:', error.response?.data || error.message);
    throw error;
  }
};

// Update check-in/check-out availability (COA/COD)
export const updateHostawayCheckInOut = async (
  listingId: number,
  startDate: string,
  endDate: string,
  checkInAvailable: boolean,
  checkOutAvailable: boolean
): Promise<any> => {
  try {
    if (!HOSTAWAY_TOKEN) {
      throw new Error("HOSTAWAY_TOKEN environment variable is not set");
    }

    console.log('Updating Hostaway check-in/out availability:', {
      listingId,
      startDate,
      endDate,
      checkInAvailable,
      checkOutAvailable,
      url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
    });

    const payload = {
      startDate,
      endDate,
      checkInAvailable,
      checkOutAvailable
    };

    const { data } = await axios.put(
      `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`,
      payload,
      {
        headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` }
      }
    );
    
    return data;
  } catch (error: any) {
    console.error('Error updating Hostaway check-in/out:', error.response?.data || error.message);
    throw error;
  }
};

// Bulk update multiple properties with pricing
export const bulkUpdateHostawayPricing = async (
  properties: number[],
  startDate: string,
  endDate: string,
  price: number
): Promise<any[]> => {
  const results = [];
  
  for (const propertyId of properties) {
    try {
      const result = await updateHostawayPricing(propertyId, startDate, endDate, price);
      results.push({ propertyId, success: true, data: result });
    } catch (error) {
      results.push({ propertyId, success: false, error: (error as Error).message });
    }
  }
  
  return results;
};

// Bulk update multiple properties with minimum stay
export const bulkUpdateHostawayMinimumStay = async (
  properties: number[],
  startDate: string,
  endDate: string,
  minimumStay: number
): Promise<any[]> => {
  const results = [];
  
  for (const propertyId of properties) {
    try {
      const result = await updateHostawayMinimumStay(propertyId, startDate, endDate, minimumStay);
      results.push({ propertyId, success: true, data: result });
    } catch (error) {
      results.push({ propertyId, success: false, error: (error as Error).message });
    }
  }
  
  return results;
};

// Update maintenance status for specific dates
export const updateHostawayMaintenance = async (
  listingId: number,
  startDate: string,
  endDate: string,
  maintenanceType: string,
  description?: string
): Promise<any> => {
  try {
    if (!HOSTAWAY_TOKEN) {
      throw new Error("HOSTAWAY_TOKEN environment variable is not set");
    }

    console.log('Updating Hostaway maintenance:', {
      listingId,
      startDate,
      endDate,
      maintenanceType,
      description,
      url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
    });

    const payload = {
      startDate,
      endDate,
      status: 'unavailable',
      reason: `Maintenance: ${maintenanceType}`,
      description: description || `Scheduled maintenance: ${maintenanceType}`,
      maintenanceType
    };

    const { data } = await axios.put(
      `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`,
      payload,
      {
        headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` }
      }
    );
    
    return data;
  } catch (error: any) {
    console.error('Error updating Hostaway maintenance:', error.response?.data || error.message);
    throw error;
  }
};

// Update cleaning status for specific dates
export const updateHostawayCleaning = async (
  listingId: number,
  startDate: string,
  endDate: string,
  cleaningType: string,
  description?: string
): Promise<any> => {
  try {
    if (!HOSTAWAY_TOKEN) {
      throw new Error("HOSTAWAY_TOKEN environment variable is not set");
    }

    console.log('Updating Hostaway cleaning:', {
      listingId,
      startDate,
      endDate,
      cleaningType,
      description,
      url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
    });

    const payload = {
      startDate,
      endDate,
      status: 'unavailable',
      reason: `Cleaning: ${cleaningType}`,
      description: description || `Scheduled cleaning: ${cleaningType}`,
      cleaningType
    };

    const { data } = await axios.put(
      `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`,
      payload,
      {
        headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` }
      }
    );
    
    return data;
  } catch (error: any) {
    console.error('Error updating Hostaway cleaning:', error.response?.data || error.message);
    throw error;
  }
};

// Update check-in/check-out availability (COA/COD) - Enhanced version
export const updateHostawayCOACOD = async (
  listingId: number,
  startDate: string,
  endDate: string,
  checkInAvailable: boolean,
  checkOutAvailable: boolean,
  reason?: string
): Promise<any> => {
  try {
    if (!HOSTAWAY_TOKEN) {
      throw new Error("HOSTAWAY_TOKEN environment variable is not set");
    }

    console.log('Updating Hostaway COA/COD:', {
      listingId,
      startDate,
      endDate,
      checkInAvailable,
      checkOutAvailable,
      reason,
      url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
    });

    const payload = {
      startDate,
      endDate,
      checkInAvailable,
      checkOutAvailable,
      reason: reason || `Check-in: ${checkInAvailable ? 'Available' : 'Not Available'}, Check-out: ${checkOutAvailable ? 'Available' : 'Not Available'}`,
      description: `COA/COD Control - Check-in: ${checkInAvailable ? 'Yes' : 'No'}, Check-out: ${checkOutAvailable ? 'Yes' : 'No'}`
    };

    const { data } = await axios.put(
      `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`,
      payload,
      {
        headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` }
      }
    );
    
    return data;
  } catch (error: any) {
    console.error('Error updating Hostaway COA/COD:', error.response?.data || error.message);
    throw error;
  }
};

// Bulk update multiple properties with maintenance
export const bulkUpdateHostawayMaintenance = async (
  properties: number[],
  startDate: string,
  endDate: string,
  maintenanceType: string,
  description?: string
): Promise<any[]> => {
  const results = [];
  
  for (const propertyId of properties) {
    try {
      const result = await updateHostawayMaintenance(propertyId, startDate, endDate, maintenanceType, description);
      results.push({ propertyId, success: true, data: result });
    } catch (error) {
      results.push({ propertyId, success: false, error: (error as Error).message });
    }
  }
  
  return results;
};

// Bulk update multiple properties with cleaning
export const bulkUpdateHostawayCleaning = async (
  properties: number[],
  startDate: string,
  endDate: string,
  cleaningType: string,
  description?: string
): Promise<any[]> => {
  const results = [];
  
  for (const propertyId of properties) {
    try {
      const result = await updateHostawayCleaning(propertyId, startDate, endDate, cleaningType, description);
      results.push({ propertyId, success: true, data: result });
    } catch (error) {
      results.push({ propertyId, success: false, error: (error as Error).message });
    }
  }
  
  return results;
};

// Bulk update multiple properties with COA/COD
export const bulkUpdateHostawayCOACOD = async (
  properties: number[],
  startDate: string,
  endDate: string,
  checkInAvailable: boolean,
  checkOutAvailable: boolean,
  reason?: string
): Promise<any[]> => {
  const results = [];
  
  for (const propertyId of properties) {
    try {
      const result = await updateHostawayCOACOD(propertyId, startDate, endDate, checkInAvailable, checkOutAvailable, reason);
      results.push({ propertyId, success: true, data: result });
    } catch (error) {
      results.push({ propertyId, success: false, error: (error as Error).message });
    }
  }
  
  return results;
};

// Get reviews from Hostaway API
export const getHostawayReviews = async (
  listingId: number,
  limit: number = 50,
  offset: number = 0
): Promise<any> => {
  try {
    console.log('Fetching Hostaway reviews:', {
      listingId,
      limit,
      offset,
      url: `${HOSTAWAY_BASE_URL}/reviews`
    });

    const response = await axios.get(`${HOSTAWAY_BASE_URL}/reviews`, {
      headers: {
        'Authorization': `Bearer ${HOSTAWAY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 1000, // Get more reviews to filter properly
        offset: 0
        // Note: Hostaway API doesn't support listingId parameter filtering
      }
    });

    console.log('Hostaway reviews response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Hostaway reviews:', {
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/reviews`
    });
    throw error;
  }
};

// Respond to a Hostaway review
export const respondToHostawayReview = async (
  reviewId: string,
  responseText: string
): Promise<any> => {
  try {
    console.log('Responding to Hostaway review:', {
      reviewId,
      responseText,
      url: `${HOSTAWAY_BASE_URL}/reviews/${reviewId}/response`
    });

    const response = await axios.post(
      `${HOSTAWAY_BASE_URL}/reviews/${reviewId}/response`,
      {
        response: responseText
      },
      {
        headers: {
          'Authorization': `Bearer ${HOSTAWAY_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Hostaway review response posted:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error responding to Hostaway review:', error.response?.data || error.message);
    throw error;
  }
};

// Get owner statements from Hostaway API
export const getHostawayOwnerStatements = async (
  listingId?: number,
  startDate?: string,
  endDate?: string,
  limit: number = 50,
  offset: number = 0
): Promise<any> => {
  try {
    console.log('Fetching Hostaway owner statements:', {
      listingId,
      startDate,
      endDate,
      limit,
      offset,
      url: `${HOSTAWAY_BASE_URL}/ownerStatements`
    });

    const params: any = {
      limit,
      offset
    };

    if (listingId) {
      params.listingId = listingId;
    }
    if (startDate) {
      params.startDate = startDate;
    }
    if (endDate) {
      params.endDate = endDate;
    }

    const response = await axios.get(`${HOSTAWAY_BASE_URL}/ownerStatements`, {
      headers: {
        'Authorization': `Bearer ${HOSTAWAY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params
    });

    console.log('Hostaway owner statements response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Hostaway owner statements:', {
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: `${HOSTAWAY_BASE_URL}/ownerStatements`
    });
    throw error;
  }
};

// Get specific owner statement by ID
export const getHostawayOwnerStatement = async (statementId: string): Promise<any> => {
  try {
    console.log('Fetching Hostaway owner statement:', {
      statementId,
      url: `${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}`
    });

    const response = await axios.get(`${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}`, {
      headers: {
        'Authorization': `Bearer ${HOSTAWAY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Hostaway owner statement response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Hostaway owner statement:', {
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: `${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}`
    });
    throw error;
  }
};

// Download owner statement as PDF
export const downloadHostawayOwnerStatementPDF = async (statementId: string): Promise<any> => {
  try {
    console.log('Downloading Hostaway owner statement PDF:', {
      statementId,
      url: `${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}/pdf`
    });

    const response = await axios.get(`${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}/pdf`, {
      headers: {
        'Authorization': `Bearer ${HOSTAWAY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });

    console.log('Hostaway owner statement PDF downloaded');
    return response.data;
  } catch (error: any) {
    console.error('Error downloading Hostaway owner statement PDF:', {
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: `${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}/pdf`
    });
    throw error;
  }
};

// Download owner statement as CSV
export const downloadHostawayOwnerStatementCSV = async (statementId: string): Promise<any> => {
  try {
    console.log('Downloading Hostaway owner statement CSV:', {
      statementId,
      url: `${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}/csv`
    });

    const response = await axios.get(`${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}/csv`, {
      headers: {
        'Authorization': `Bearer ${HOSTAWAY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });

    console.log('Hostaway owner statement CSV downloaded');
    return response.data;
  } catch (error: any) {
    console.error('Error downloading Hostaway owner statement CSV:', {
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: `${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}/csv`
    });
    throw error;
  }
};

// Get expenses and extras from Hostaway
export const getHostawayExpenses = async (
  listingId?: number,
  startDate?: string,
  endDate?: string,
  limit: number = 100,
  offset: number = 0
): Promise<any> => {
  try {
    console.log('Fetching Hostaway expenses:', {
      listingId,
      startDate,
      endDate,
      limit,
      offset,
      url: `${HOSTAWAY_BASE_URL}/expensesExtras`
    });

    const params: any = {
      limit,
      offset
    };

    if (listingId) {
      params.listingMapId = listingId;
    }
    if (startDate) {
      params.startDate = startDate;
    }
    if (endDate) {
      params.endDate = endDate;
    }

    const response = await axios.get(`${HOSTAWAY_BASE_URL}/expensesExtras`, {
      headers: {
        'Authorization': `Bearer ${HOSTAWAY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params
    });

    console.log('Hostaway expenses response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Hostaway expenses:', {
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: `${HOSTAWAY_BASE_URL}/expensesExtras`
    });
    throw error;
  }
};

// Update calendar availability (block/unblock dates)
export const updateHostawayCalendarAvailability = async (
  listingId: number, 
  startDate: string, 
  endDate: string, 
  isAvailable: number
) => {
  try {
    console.log('Calling Hostaway calendar availability update:', {
      listingId,
      startDate,
      endDate,
      isAvailable
    });

    const { data } = await axios.put(
      `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`,
      {
        startDate,
        endDate,
        isAvailable,
        note: isAvailable === 1 ? "Unblocked via Owner Portal" : "Blocked via Owner Portal"
      },
      {
        headers: { 
          Authorization: `Bearer ${HOSTAWAY_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Hostaway calendar availability update response:', data);
    return data;
  } catch (error: any) {
    console.error("Error updating Hostaway calendar availability:", error.response?.data || error.message);
    throw error;
  }
};

// Get real-time daily calendar data with pricing and availability
export const getHostawayDailyCalendar = async (
  listingId: number,
  startDate: string,
  endDate: string
) => {
  try {
    console.log('Fetching Hostaway daily calendar:', {
      listingId,
      startDate,
      endDate
    });

    const { data } = await axios.get(
      `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`,
      {
        headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` },
        params: { 
          startDate, 
          endDate
        }
      }
    );
    
    console.log('Hostaway daily calendar response:', data);
    console.log('Hostaway response dates:', data.result?.map((d: any) => d.date) || 'No result');
    return data;
  } catch (error: any) {
    console.error('Error fetching Hostaway daily calendar:', error.response?.data || error.message);
    throw error;
  }
};
