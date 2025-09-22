import { RootState } from '../store'

/**
 * Get property name by ID from Redux store
 * This ensures all components use the same dynamic property data
 */
export const getPropertyName = (propertyId: number, state: RootState): string => {
  const property = state.properties.properties.find(p => p.id === propertyId)
  return property ? property.name : `Property ${propertyId}`
}

/**
 * Get property by ID from Redux store
 */
export const getPropertyById = (propertyId: number, state: RootState) => {
  return state.properties.properties.find(p => p.id === propertyId)
}

/**
 * Get all active properties from Redux store
 */
export const getActiveProperties = (state: RootState) => {
  return state.properties.properties.filter(p => p.status === 'active')
}

/**
 * Check if a property exists in the database
 */
export const propertyExists = (propertyId: number, state: RootState): boolean => {
  return state.properties.properties.some(p => p.id === propertyId)
}
