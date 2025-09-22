import { apiClient } from './apiClient'
import { User } from '../store/auth.slice'

interface LoginCredentials {
  email: string
  password: string
}

interface SignupData {
  email: string
  name: string
  phone?: string
  password: string
  role?: string
}

interface OTPData {
  email: string
  otp: string
}

interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

interface ForgotPasswordData {
  email: string
}

interface ResetPasswordData {
  email: string
  otp: string
  password: string
}

export const authAPI = {
  async sendLoginOTP(credentials: LoginCredentials): Promise<{ message: string }> {
    return apiClient.post('/auth/send-login-otp', credentials)
  },

  async verifyLoginOTP(data: OTPData): Promise<AuthResponse> {
    return apiClient.post('/auth/verify-login-otp', data)
  },

  async sendSignupOTP(userData: SignupData): Promise<{ message: string }> {
    return apiClient.post('/auth/send-signup-otp', userData)
  },

  async verifySignupOTP(data: OTPData & SignupData): Promise<AuthResponse> {
    return apiClient.post('/auth/verify-signup-otp', data)
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get('/auth/me')
  },

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    return apiClient.post('/auth/forgot-password', data)
  },

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    return apiClient.post('/auth/reset-password', data)
  },

  async logout(): Promise<void> {
    return apiClient.post('/auth/logout')
  },
}
