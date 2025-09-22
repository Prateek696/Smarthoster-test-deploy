import { apiClient } from './apiClient'

// Check if admin exists
export const checkAdminExists = async (): Promise<boolean> => {
  const response = await apiClient.get('/admin/check-admin-exists')
  return response.data.exists
}

export interface Owner {
  _id: string
  name: string
  email: string
  phone?: string
  role: string
  isVerified: boolean
  hasApiKeys: boolean
  apiKeysActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateOwnerData {
  name: string
  email: string
  phone?: string
  role?: 'owner' | 'accountant'
  password?: string
  hostkitApiId?: string
  hostkitApiKey?: string
  hostkitApiSecret?: string
  assignedProperties?: string[]
}

export interface UpdateOwnerData {
  name?: string
  email?: string
  phone?: string
  role?: string
  hostkitApiKey?: string
  hostkitApiSecret?: string
}

export interface AdminDashboardStats {
  totalOwners: number
  totalAccountants: number
  totalProperties: number
  ownersWithApiKeys: number
  recentProperties: any[]
}

export interface Accountant {
  _id: string
  name: string
  email: string
  phone?: string
  role: string
  isVerified: boolean
  assignedProperties: any[]
  assignedPropertiesCount: number
  createdAt: string
  updatedAt: string
}

export interface AssignPropertyData {
  propertyId: string
  ownerId: string
}

// Get admin dashboard stats
export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const response = await apiClient.get('/admin/dashboard/stats')
  return response.data
}

// Get all owners
export const getAllOwners = async (): Promise<Owner[]> => {
  const response = await apiClient.get('/admin/owners')
  return response.data
}

// Get all accountants
export const getAllAccountants = async (): Promise<Accountant[]> => {
  const response = await apiClient.get('/admin/accountants')
  return response.data
}

// Update accountant
export const updateAccountant = async (accountantId: string, accountantData: { name?: string; email?: string; phone?: string; password?: string }): Promise<Accountant> => {
  const response = await apiClient.put(`/admin/accountants/${accountantId}`, accountantData)
  return response.data.data
}

// Update accountant property assignments
export const updateAccountantProperties = async (accountantId: string, assignedProperties: string[]): Promise<Accountant> => {
  const response = await apiClient.put(`/admin/accountants/${accountantId}/properties`, { assignedProperties })
  return response.data.data
}

// Owner Statement interfaces
export interface OwnerStatement {
  property: {
    id: number
    name: string
    owner: string
    isAdminOwned: boolean
  }
  period: {
    startDate: string
    endDate: string
  }
  calculations: {
    grossAmount: number
    portalCommission: number
    cleaningFee: number
    managementCommission: number
    finalOwnerAmount: number
  }
  invoiceCount: number
  invoices: Array<{
    id: string
    name: string
    value: number
    date: string
    series: string
  }>
}

// Owner Statement API
export const generateOwnerStatement = async (
  propertyId: number, 
  startDate: string, 
  endDate: string
): Promise<OwnerStatement> => {
  const response = await apiClient.get(
    `/admin/properties/${propertyId}/owner-statement?startDate=${startDate}&endDate=${endDate}`
  )
  return response.data.statement
}

// Delete accountant
export const deleteAccountant = async (accountantId: string): Promise<void> => {
  await apiClient.delete(`/admin/accountants/${accountantId}`)
}

// Create new owner
export const createOwner = async (ownerData: CreateOwnerData): Promise<Owner> => {
  const response = await apiClient.post('/admin/owners', ownerData)
  console.log('🔍 createOwner API response:', response)
  return response.data.data || response.data
}

// Update owner
export const updateOwner = async (ownerId: string, ownerData: UpdateOwnerData): Promise<Owner> => {
  const response = await apiClient.put(`/admin/owners/${ownerId}`, ownerData)
  return response.data
}

// Delete owner
export const deleteOwner = async (ownerId: string): Promise<void> => {
  await apiClient.delete(`/admin/owners/${ownerId}`)
}

// Get all properties (admin view)
export const getAllProperties = async (ownerId?: string): Promise<any[]> => {
  const url = ownerId 
    ? `/admin/properties?ownerId=${ownerId}`
    : '/admin/properties'
  const response = await apiClient.get(url)
  console.log('🔍 getAllProperties response:', response)
  
  // Handle different response structures
  if (response.data && response.data.data) {
    return response.data.data
  } else if (response.data && response.data.properties) {
    return response.data.properties
  } else if (Array.isArray(response.data)) {
    return response.data
  } else {
    console.error('Unexpected response structure:', response)
    return []
  }
}

// Assign property to owner
export const assignPropertyToOwner = async (ownerId: string, propertyId: number): Promise<{ message: string; property: any }> => {
  const response = await apiClient.post(`/admin/owners/${ownerId}/assign-property`, { propertyId })
  return response.data
}

// Delete property
export const deleteProperty = async (propertyId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/admin/properties/${propertyId}`)
  return response.data
}

// Get owner API keys
export const getOwnerApiKeys = async (ownerId: string): Promise<any> => {
  const response = await apiClient.get(`/admin/owners/${ownerId}/api-keys`)
  return response.data
}

// Update owner API keys
export const updateOwnerApiKeys = async (
  ownerId: string, 
  hostkitApiKey: string, 
  hostkitApiSecret: string
): Promise<void> => {
  await apiClient.put(`/admin/owners/${ownerId}/api-keys`, {
    hostkitApiKey,
    hostkitApiSecret
  })
}
