import { apiClient } from './apiClient'
import { Booking } from '../store/bookings.slice'

export interface BookingsApiParams {
  propertyId?: number
  startDate?: string
  endDate?: string
  status?: string
  limit?: number
  offset?: number
}

export const bookingsAPI = {
  getBookings: async (params: BookingsApiParams = {}): Promise<Booking[]> => {
    // Property ID is required for backend endpoint structure
    if (!params.propertyId) {
      throw new Error('Property ID is required for fetching bookings')
    }

    const queryParams = new URLSearchParams()
    
    // Add date parameters for filtering
    if (params.startDate) queryParams.append('dateStart', params.startDate) // Backend expects dateStart
    if (params.endDate) queryParams.append('dateEnd', params.endDate) // Backend expects dateEnd
    if (params.status) queryParams.append('status', params.status)
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.offset) queryParams.append('offset', params.offset.toString())

    // Use correct backend endpoint structure: /bookings/:propertyId
    const url = `/bookings/${params.propertyId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await apiClient.get(url)
    return response.bookings || response // Handle both formats
  },

  getBookingById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get(`/bookings/${id}`)
    return response.data
  },

  getBookingsByProperty: async (propertyId: number, params: Omit<BookingsApiParams, 'propertyId'> = {}): Promise<any> => {
    const result = await bookingsAPI.getBookings({ ...params, propertyId })
    return result
  },

  exportBookings: async (params: BookingsApiParams = {}): Promise<Blob> => {
    const queryParams = new URLSearchParams()
    
    if (params.propertyId) queryParams.append('propertyId', params.propertyId.toString())
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)
    if (params.status) queryParams.append('status', params.status)

    const response = await apiClient.get(`/bookings/export?${queryParams.toString()}`, {
      responseType: 'blob'
    })
    return response.data
  }
}

