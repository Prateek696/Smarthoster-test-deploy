import { apiClient } from './apiClient'
import { SibaStatus } from '../store/siba.slice'

export const sibaAPI = {
  getSibaStatus: async (propertyId: number): Promise<SibaStatus> => {
    try {
      const response = await apiClient.get(`/properties/${propertyId}/siba-status`)
      return response
    } catch (error: any) {
      console.error('SIBA API: Error in getSibaStatus:', error)
      throw error
    }
  },

  submitSiba: async (propertyId: number, reservationId: number, data?: any): Promise<{ success: boolean; message: string }> => {
    const requestData = { reservationId, ...data }
    const response = await apiClient.post(`/properties/${propertyId}/siba/send`, requestData)
    return response.data
  },

  validateSiba: async (reservationId: number): Promise<{ valid: boolean; issues: any[] }> => {
    const response = await apiClient.get(`/properties/siba/validate/${reservationId}`)
    return response.data
  },

  getSibaHistory: async (reservationId: number): Promise<any[]> => {
    const response = await apiClient.get(`/properties/siba/logs/${reservationId}`)
    return response.data
  },

  exportSibaReport: async (propertyId: number, startDate?: string, endDate?: string): Promise<Blob> => {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await apiClient.get(`/properties/${propertyId}/siba/export`, {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  debugSiba: async (propertyId: number): Promise<any> => {
    const response = await apiClient.get(`/properties/${propertyId}/siba/debug`)
    return response.data
  }
}



