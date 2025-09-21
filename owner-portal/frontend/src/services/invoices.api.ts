import { apiClient } from './apiClient'
import { Invoice } from '../store/invoices.slice'

export interface InvoicesApiParams {
  propertyId: number
  startDate?: string
  endDate?: string
  status?: string
  limit?: number
  offset?: number
}

export const invoicesAPI = {
  getInvoices: async (params: InvoicesApiParams): Promise<Invoice[]> => {
    const queryParams = new URLSearchParams()
    
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)
    if (params.status) queryParams.append('status', params.status)
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.offset) queryParams.append('offset', params.offset.toString())

    const response = await apiClient.get(`/invoices/${params.propertyId}?${queryParams.toString()}`)
    return response.invoices || response.data || response // Handle multiple response formats
  },

  getInvoiceById: async (propertyId: number, invoiceId: string): Promise<Invoice> => {
    const response = await apiClient.get(`/invoices/${propertyId}/${invoiceId}`)
    return response.data
  },

  downloadInvoice: async (propertyId: number, invoiceId: string): Promise<Blob> => {
    const response = await apiClient.get(`/invoices/${propertyId}/${invoiceId}/download`, {
      responseType: 'blob'
    })
    return response.data
  },

  exportInvoices: async (params: InvoicesApiParams): Promise<Blob> => {
    const queryParams = new URLSearchParams()
    
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)
    if (params.status) queryParams.append('status', params.status)

    const response = await apiClient.get(`/invoices/${params.propertyId}/export?${queryParams.toString()}`, {
      responseType: 'blob'
    })
    return response.data
  },

  debugInvoices: async (params: InvoicesApiParams): Promise<any> => {
    const queryParams = new URLSearchParams()
    
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)

    const response = await apiClient.get(`/invoices/${params.propertyId}/debug?${queryParams.toString()}`)
    return response.data
  }
}



