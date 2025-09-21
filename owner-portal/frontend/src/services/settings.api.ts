import { apiClient } from './apiClient'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

interface NotificationSettings {
  emailNotifications: boolean
  bookingAlerts: boolean
  paymentAlerts: boolean
  maintenanceAlerts: boolean
  weeklyReports: boolean
  monthlyReports: boolean
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  sessionTimeout: number
  loginAlerts: boolean
}

interface UpdateProfileData {
  name: string
  phone?: string
}

interface UpdateNotificationData {
  emailNotifications: boolean
  bookingAlerts: boolean
  paymentAlerts: boolean
  maintenanceAlerts: boolean
  weeklyReports: boolean
  monthlyReports: boolean
}

interface UpdateSecurityData {
  twoFactorEnabled: boolean
  sessionTimeout: number
  loginAlerts: boolean
}

export const settingsAPI = {
  // Profile endpoints
  async getUserProfile(): Promise<UserProfile> {
    return apiClient.get('/settings/profile')
  },

  async updateUserProfile(data: UpdateProfileData): Promise<{ message: string; user: UserProfile }> {
    return apiClient.put('/settings/profile', data)
  },

  // Notification endpoints
  async getNotificationSettings(): Promise<NotificationSettings> {
    return apiClient.get('/settings/notifications')
  },

  async updateNotificationSettings(data: UpdateNotificationData): Promise<{ message: string; settings: NotificationSettings }> {
    return apiClient.put('/settings/notifications', data)
  },

  // Security endpoints
  async getSecuritySettings(): Promise<SecuritySettings> {
    return apiClient.get('/settings/security')
  },

  async updateSecuritySettings(data: UpdateSecurityData): Promise<{ message: string; settings: SecuritySettings }> {
    return apiClient.put('/settings/security', data)
  }
}

