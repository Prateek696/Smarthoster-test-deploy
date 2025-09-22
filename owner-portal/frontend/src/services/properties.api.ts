import apiClient from './apiClient';

export interface Property {
  _id?: string;
  id: number;
  name: string;
  address: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  hostkitId: string;
  hostkitApiKey?: string; // Optional for security (not returned in GET requests)
  status: 'active' | 'inactive' | 'maintenance';
  images: string[];
  amenities: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePropertyData {
  id: number;
  name: string;
  address: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  hostkitId: string;
  hostkitApiKey: string;
  status?: 'active' | 'inactive' | 'maintenance';
  images?: string[];
  amenities?: string[];
  owner?: string; // Owner ID or 'admin'
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalBookings: number;
  totalNights: number;
  averageOccupancy: number;
  averageDailyRate: number;
  properties: Array<{
    id: number;
    name: string;
    revenue: number;
    bookings: number;
    occupancy: number;
    nights: number;
  }>;
  recentBookings: Array<{
    guest: string;
    property: string;
    checkIn: string;
    amount: number;
    propertyId: number;
  }>;
}

export interface HostkitTestResult {
  success: boolean;
  message: string;
  data?: any;
}

// Get all properties
export const getProperties = async (): Promise<{ properties: Property[]; total: number }> => {
  // Add aggressive cache-busting parameters to ensure fresh data
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const response = await apiClient.get(`/property-management?t=${timestamp}&r=${random}&nocache=true`);
  return response;
};

// Create new property
export const createProperty = async (propertyData: CreatePropertyData): Promise<{ 
  message: string; 
  property: Property; 
  hostkitTest?: HostkitTestResult; 
}> => {
  console.log('🔍 createProperty API called with:', {
    propertyData: Object.keys(propertyData),
    url: '/admin/properties',
    method: 'POST'
  });
  const response = await apiClient.post('/admin/properties', propertyData);
  console.log('✅ createProperty API response:', response);
  return response.data;
};

// Get property by ID
export const getPropertyById = async (propertyId: string): Promise<{ property: Property }> => {
  const response = await apiClient.get(`/property-management/${propertyId}`);
  return response.data;
};

// Update property
export const updateProperty = async (
  propertyId: string, 
  propertyData: Partial<CreatePropertyData>
): Promise<{ message: string; property: Property }> => {
  console.log('🔍 updateProperty API called with:', {
    propertyId,
    propertyData: Object.keys(propertyData),
    url: `/property-management/${propertyId}`,
    method: 'PUT'
  });
  const response = await apiClient.put(`/property-management/${propertyId}`, propertyData);
  console.log('✅ updateProperty API response:', response);
  console.log('🔍 Response type:', typeof response);
  
  if (!response) {
    console.error('❌ Invalid response from apiClient.put:', response);
    throw new Error('Invalid response from server');
  }
  
  return response;
};

// Delete property
export const deleteProperty = async (propertyId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/admin/properties/${propertyId}`);
  return response.data;
};

// Test Hostkit connection
export const testHostkitConnection = async (
  hostkitId: string, 
  apiKey: string
): Promise<HostkitTestResult> => {
  const response = await apiClient.post('/property-management/test-hostkit', {
    hostkitId,
    apiKey
  });
  return response.data;
};

// Get dashboard metrics
export const getDashboardMetrics = async (
  startDate?: string, 
  endDate?: string
): Promise<DashboardMetrics> => {
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const response = await apiClient.get('/property-management/dashboard/metrics', { params });
  return response.data;
};
