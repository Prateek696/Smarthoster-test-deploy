// COMMENTED OUT - City Tax API removed per user request
/*
import { apiClient } from './apiClient'

export interface CityTaxParams {
  propertyId: number
  startDate: string
  endDate: string
  filterType?: 'checkin' | 'checkout'
}

export interface CityTaxData {
  propertyId: number
  startDate: string
  endDate: string
  // City Tax Report Data (matching Hostkit format)
  cityTaxCalculated: number
  cityTaxCalculatedFormatted: string
  cityTaxNights: number
  childrenNights: number
  nightsBeyond: number
  totalNights: number
  hostkitTotalNights: number
  cityTaxInvoiced: number
  cityTaxInvoicedFormatted: string
  cityTaxInvoicedNights: number
  // Legacy fields for compatibility
  totalTax: number
  totalTaxFormatted: string
  totalBookings: number
  totalGuests: number
  adultNights: number
  exemptNights: number
  taxableNights: number
  averageTaxPerNight: number
  averageTaxPerNightFormatted: string
  averageTaxPerGuest: number
  averageTaxPerGuestFormatted: string
  bookingsPlatforms: { [key: string]: number }
  taxStatus: string
  dataSource: string
  futureReady: boolean
  currency: string
}

export interface CityTaxDashboardData {
  startDate: string
  endDate: string
  filterType: 'checkin' | 'checkout'
  properties: Array<CityTaxData & { propertyId: number; hostkitApid: string; error?: string }>
  totals: {
    totalCityTaxNights: number
    totalChildrenNights: number
    totalNights: number
    totalBookings: number
    totalGuests: number
  }
}

export const cityTaxAPI = {
  getCityTax: async (params: CityTaxParams): Promise<CityTaxData> => {
    try {
      const response = await apiClient.get(`/properties/${params.propertyId}/city-tax`, {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          filterType: params.filterType || 'checkin'
        },
        timeout: 10000 // 10 second timeout
      })
      return response
    } catch (error: any) {
      console.error('City Tax API Error:', error.response?.data || error.message);
      console.error('City Tax API Error Details:', error);
      throw error;
    }
  },

  getCityTaxDashboard: async (params: { startDate: string; endDate: string; filterType?: 'checkin' | 'checkout' }): Promise<CityTaxDashboardData> => {
    try {
      const response = await apiClient.get('/properties/city-tax/dashboard', {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          filterType: params.filterType || 'checkin',
          _t: Date.now() // Cache busting parameter
        },
        timeout: 15000 // 15 second timeout for multiple properties
      })
      return response
    } catch (error: any) {
      console.error('City Tax Dashboard API Error:', error.response?.data || error.message);
      throw error;
    }
  }
}
*/
