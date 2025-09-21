export type UserRole = 'admin' | 'owner' | 'accountant' | 'user'

export const toFrontendRole = (role: string | undefined | null): UserRole => {
  // Handle undefined, null, or empty string cases
  if (!role || typeof role !== 'string') {
    return 'user' // Default to 'user' role
  }
  
  switch (role.toLowerCase()) {
    case 'admin':
      return 'admin'
    case 'owner':
      return 'owner'
    case 'accountant':
      return 'accountant'
    case 'user':
    default:
      return 'user'
  }
}

export const hasRole = (userRole: UserRole | null, requiredRoles: UserRole[]): boolean => {
  if (!userRole) return false
  return requiredRoles.includes(userRole)
}

export const isAdmin = (userRole: UserRole | null): boolean => {
  return hasRole(userRole, ['admin'])
}

export const isOwner = (userRole: UserRole | null): boolean => {
  return hasRole(userRole, ['owner'])
}

export const isAccountant = (userRole: UserRole | null): boolean => {
  return hasRole(userRole, ['accountant'])
}

export const isOwnerOrAccountant = (userRole: UserRole | null): boolean => {
  return hasRole(userRole, ['owner', 'accountant'])
}

export const isAdminOrOwner = (userRole: UserRole | null): boolean => {
  return hasRole(userRole, ['admin', 'owner'])
}

export const canUpdateCalendar = (userRole: UserRole | null): boolean => {
  return isAdminOrOwner(userRole)
}

export const canUpdateProperties = (userRole: UserRole | null): boolean => {
  return isAdmin(userRole) // Only admins can update properties, not owners
}

export const canViewReviews = (userRole: UserRole | null): boolean => {
  return isAdminOrOwner(userRole)
}

export const canManageOwners = (userRole: UserRole | null): boolean => {
  return isAdmin(userRole)
}

export const canViewAllProperties = (userRole: UserRole | null): boolean => {
  return isAdmin(userRole) || isAccountant(userRole)
}