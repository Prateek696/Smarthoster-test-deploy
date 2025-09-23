import { apiClient } from './apiClient';

export interface CalendarDateData {
  date: string;
  listingId: number;
  status: string;
  price: number | null;
  minimumStay: number | null;
  checkInAvailable: boolean;
  checkOutAvailable: boolean;
  reason: string | null;
  description: string | null;
  rawData: any;
}

export interface UpdatePricingData {
  startDate: string;
  endDate: string;
  price: number;
}

export interface UpdateMinimumStayData {
  startDate: string;
  endDate: string;
  minimumStay: number;
}

// Get calendar date data with pricing and minimum nights
export const getCalendarDateData = async (
  listingId: number,
  date: string
): Promise<CalendarDateData> => {
  const response = await apiClient.get(`/calendar/${listingId}/date/${date}`);
  return response;
};

// Get monthly pricing data for calendar display
export const getCalendarMonthPricing = async (
  listingId: number,
  year: number,
  month: number
): Promise<{[key: string]: {price: number, minimumStay: number, status: string}}> => {
  console.log('API: Fetching calendar pricing for:', { listingId, year, month });
  const response = await apiClient.get(`/calendar/${listingId}/month/${year}/${month}`);
  console.log('API: Raw response:', response);
  console.log('API: Pricing data:', response.pricingData);
  return response.pricingData;
};

// Update pricing for specific dates
export const updateCalendarPricing = async (
  listingId: number,
  data: UpdatePricingData
): Promise<any> => {
  const response = await apiClient.put(`/calendar/${listingId}/pricing`, data);
  return response;
};

// Update minimum stay for specific dates
export const updateCalendarMinimumStay = async (
  listingId: number,
  data: UpdateMinimumStayData
): Promise<any> => {
  const response = await apiClient.put(`/calendar/${listingId}/minimum-stay`, data);
  return response;
};

// Block/Unblock dates via Hostaway API (using isAvailable parameter)
export const updateCalendarAvailability = async (
  listingId: number,
  startDate: string,
  endDate: string,
  isAvailable: number
): Promise<any> => {
  const response = await apiClient.put('/calendar', {
    listingId,
    startDate,
    endDate,
    isAvailable
  });
  return response;
};

// Block/Unblock dates via Hostaway API (using status parameter - more reliable)
export const updateCalendarStatus = async (
  listingId: number,
  startDate: string,
  endDate: string,
  status: 'blocked' | 'available'
): Promise<any> => {
  const response = await apiClient.put(`/calendar/${listingId}`, {
    startDate,
    endDate,
    status
  });
  return response;
};
