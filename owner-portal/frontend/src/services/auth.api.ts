import { apiClient } from './apiClient'
import { User } from '../store/auth.slice'
import axios from 'axios'
import { API_URLS } from '../config/api'
import { retryRequest } from '../utils/retryRequest'

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
  newPassword?: string
}

export const authAPI = {
  async sendLoginOTP(credentials: LoginCredentials): Promise<{ message: string }> {
    // Use Vercel backend for OTP sending with retry logic for cold starts
    return retryRequest(
      () => axios.post(`${API_URLS.auth}/auth/send-login-otp`, credentials),
      {
        maxRetries: 3,
        initialDelay: 2000,
        onRetry: (attempt) => {
          console.log(`🔄 Retrying OTP request (attempt ${attempt}/3) - server is waking up...`)
        }
      }
    )
  },

  async verifyLoginOTP(data: OTPData): Promise<AuthResponse> {
    // Use Vercel backend for OTP verification with retry logic
    return retryRequest(
      () => axios.post(`${API_URLS.auth}/auth/verify-login-otp`, data),
      {
        maxRetries: 3,
        initialDelay: 2000,
        onRetry: (attempt) => {
          console.log(`🔄 Retrying OTP verification (attempt ${attempt}/3)...`)
        }
      }
    )
  },

  async sendSignupOTP(userData: SignupData): Promise<{ message: string }> {
    // Use Vercel backend for OTP sending with retry logic
    return retryRequest(
      () => axios.post(`${API_URLS.auth}/auth/send-signup-otp`, userData),
      {
        maxRetries: 3,
        initialDelay: 2000,
        onRetry: (attempt) => {
          console.log(`🔄 Retrying signup OTP (attempt ${attempt}/3) - server is waking up...`)
        }
      }
    )
  },

  async verifySignupOTP(data: OTPData & SignupData): Promise<AuthResponse> {
    // Use Vercel backend for OTP verification with retry logic
    return retryRequest(
      () => axios.post(`${API_URLS.auth}/auth/verify-signup-otp`, data),
      {
        maxRetries: 3,
        initialDelay: 2000,
        onRetry: (attempt) => {
          console.log(`🔄 Retrying signup verification (attempt ${attempt}/3)...`)
        }
      }
    )
  },

  async getCurrentUser(): Promise<User> {
    // Use Render backend for user data (main API)
    return apiClient.get('/auth/me')
  },

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    // Use Vercel backend for password reset OTP with retry logic
    return retryRequest(
      () => axios.post(`${API_URLS.auth}/auth/forgot-password`, data),
      {
        maxRetries: 3,
        initialDelay: 2000,
        onRetry: (attempt) => {
          console.log(`🔄 Retrying password reset OTP (attempt ${attempt}/3) - server is waking up...`)
        }
      }
    )
  },

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    // Use Vercel backend for password reset with retry logic
    // Backend expects 'newPassword' field, not 'password'
    const payload = {
      email: data.email,
      otp: data.otp,
      code: data.otp, // Some endpoints use 'code' instead of 'otp'
      newPassword: data.password
    }
    
    return retryRequest(
      () => axios.post(`${API_URLS.auth}/auth/reset-password`, payload),
      {
        maxRetries: 3,
        initialDelay: 2000,
        onRetry: (attempt) => {
          console.log(`🔄 Retrying password reset (attempt ${attempt}/3)...`)
        }
      }
    )
  },

  async logout(): Promise<void> {
    // Use Render backend for logout (main API)
    return apiClient.post('/auth/logout')
  },
}
