export const USER_ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  ACCOUNTANT: 'accountant', 
  USER: 'user'
} as const;

export const ROLE_PERMISSIONS = {
  ADMIN: ['read', 'write', 'block_calendar', 'view_performance', 'view_invoices', 'generate_saft', 'view_tourist_tax', 'manage_users', 'manage_properties', 'manage_owners'],
  OWNER: ['read', 'write', 'block_calendar', 'view_performance', 'view_invoices'],
  ACCOUNTANT: ['read', 'view_invoices', 'generate_saft', 'view_tourist_tax'],
  USER: ['read']
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type Permission = typeof ROLE_PERMISSIONS[keyof typeof ROLE_PERMISSIONS][number];



