import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authAPI } from '../services/auth.api'
import { toFrontendRole, UserRole } from '../utils/roleUtils'

export interface User {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  username?: string
  role: UserRole
  isVerified?: boolean
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: localStorage.getItem('user') ? (() => {
    const user = JSON.parse(localStorage.getItem('user')!)
    return {
      ...user,
      role: toFrontendRole(user.role)
    }
  })() : null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
}

// Async thunks
export const sendLoginOTPAsync = createAsyncThunk(
  'auth/sendLoginOTP',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.sendLoginOTP(credentials)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP')
    }
  }
)

export const verifyLoginOTPAsync = createAsyncThunk(
  'auth/verifyLoginOTP',
  async (data: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyLoginOTP(data)
      localStorage.setItem('token', response.accessToken)
      return { ...response, token: response.accessToken }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Invalid OTP')
    }
  }
)

export const sendSignupOTPAsync = createAsyncThunk(
  'auth/sendSignupOTP',
  async (userData: { email: string; name: string; phone?: string; password: string; role?: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.sendSignupOTP(userData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP')
    }
  }
)

export const verifySignupOTPAsync = createAsyncThunk(
  'auth/verifySignupOTP',
  async (data: { email: string; name: string; phone?: string; password: string; otp: string; role?: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifySignupOTP(data)
      localStorage.setItem('token', response.accessToken)
      return { ...response, token: response.accessToken }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Invalid OTP')
    }
  }
)

// Legacy aliases for backward compatibility
export const loginAsync = verifyLoginOTPAsync
export const registerUser = verifySignupOTPAsync
export const signupAsync = registerUser

export const getCurrentUserAsync = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser()
      return response
    } catch (error: any) {
      localStorage.removeItem('token')
      return rejectWithValue(error.response?.data?.message || 'Failed to get user')
    }
  }
)

export const logoutAsync = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  return null
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      state.isAuthenticated = true
      localStorage.setItem('token', action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Send Login OTP
      .addCase(sendLoginOTPAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendLoginOTPAsync.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(sendLoginOTPAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Verify Login OTP
      .addCase(verifyLoginOTPAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyLoginOTPAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        // Normalize role to uppercase for frontend consistency
        const normalizedUser = {
          ...action.payload.user,
          role: toFrontendRole(action.payload.user.role)
        }
        state.user = normalizedUser
        state.token = action.payload.token
        state.error = null
        // Store user in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(normalizedUser))
      })
      .addCase(verifyLoginOTPAsync.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload as string
      })
      // Send Signup OTP
      .addCase(sendSignupOTPAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendSignupOTPAsync.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(sendSignupOTPAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Verify Signup OTP
      .addCase(verifySignupOTPAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifySignupOTPAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        // Normalize role to uppercase for frontend consistency
        const normalizedUser = {
          ...action.payload.user,
          role: toFrontendRole(action.payload.user.role)
        }
        state.user = normalizedUser
        state.token = action.payload.token
        state.error = null
        // Store user in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(normalizedUser))
      })
      .addCase(verifySignupOTPAsync.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload as string
      })
      // Get current user
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.isLoading = false
        // Normalize role to uppercase for frontend consistency
        const normalizedUser = {
          ...action.payload,
          role: toFrontendRole(action.payload.role)
        }
        state.user = normalizedUser
        state.isAuthenticated = true
      })
      .addCase(getCurrentUserAsync.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
      // Logout
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
      })
  },
})

export const { clearError, setToken } = authSlice.actions
export default authSlice.reducer
