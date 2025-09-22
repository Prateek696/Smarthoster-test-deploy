import apiClient from './apiClient';

export interface PropertyDetails {
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

// Get property details from Hostkit
export const getPropertyDetails = async (propertyId: string): Promise<PropertyDetails> => {
  const response = await apiClient.get(`/api/properties/${propertyId}`);
  return response.data;
};



