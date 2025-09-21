import { apiClient } from './apiClient'
import { CityTaxData } from '../store/touristTax.slice'

export interface TouristTaxApiParams {
  propertyId: number
  startDate: string
  endDate: string
}

export const touristTaxAPI = {
  getTouristTax: async (params: TouristTaxApiParams): Promise<{ totalTax: CityTaxData }> => {
    const response = await apiClient.get(`/properties/${params.propertyId}/tourist-tax`, {
      params: {
        startDate: params.startDate,
        endDate: params.endDate
      }
    })
    return response.data
  },

  getTouristTaxDetailed: async (params: TouristTaxApiParams): Promise<CityTaxData> => {
    const response = await apiClient.get(`/properties/${params.propertyId}/tourist-tax/detailed`, {
      params: {
        startDate: params.startDate,
        endDate: params.endDate
      }
    })
    console.log('Tourist Tax API Raw Response:', response)
    // The apiClient.get() already extracts data, so response IS the data
    return response
  },

  debugTouristTax: async (params: TouristTaxApiParams): Promise<any> => {
    const response = await apiClient.get(`/properties/${params.propertyId}/tourist-tax/debug`, {
      params: {
        startDate: params.startDate,
        endDate: params.endDate
      }
    })
    return response.data
  },

  exportTouristTaxReport: async (params: TouristTaxApiParams): Promise<Blob> => {
    const response = await apiClient.get(`/properties/${params.propertyId}/tourist-tax/export`, {
      params: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      responseType: 'blob'
    })
    return response.data
  }
}



