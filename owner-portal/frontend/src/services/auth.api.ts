import { apiClient } from './apiClient'
import { User } from '../store/auth.slice'
import axios from 'axios'
import { API_URLS } from '../config/api'

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
    // Use Vercel backend for OTP sending (email works there)
    const response = await axios.post(`${API_URLS.auth}/auth/send-login-otp`, credentials)
    return response.data
  },

  async verifyLoginOTP(data: OTPData): Promise<AuthResponse> {
    // Use Vercel backend for OTP verification (consistent with sending)
    const response = await axios.post(`${API_URLS.auth}/auth/verify-login-otp`, data)
    return response.data
  },

  async sendSignupOTP(userData: SignupData): Promise<{ message: string }> {
    // Use Vercel backend for OTP sending (email works there)
    const response = await axios.post(`${API_URLS.auth}/auth/send-signup-otp`, userData)
    return response.data
  },

  async verifySignupOTP(data: OTPData & SignupData): Promise<AuthResponse> {
    // Use Vercel backend for OTP verification (consistent with sending)
    const response = await axios.post(`${API_URLS.auth}/auth/verify-signup-otp`, data)
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    // Use Render backend for user data (main API)
    return apiClient.get('/auth/me')
  },

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    // Use Vercel backend for password reset OTP (email works there)
    const response = await axios.post(`${API_URLS.auth}/auth/forgot-password`, data)
    return response.data
  },

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    // Use Vercel backend for password reset (consistent with forgot password)
    const response = await axios.post(`${API_URLS.auth}/auth/reset-password`, data)
    return response.data
  },

  async logout(): Promise<void> {
    // Use Render backend for logout (main API)
    return apiClient.post('/auth/logout')
  },
}
