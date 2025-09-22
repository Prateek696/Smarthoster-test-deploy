import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface SibaStatus {
  propertyId: number
  lastSibaSendDate: string | null
  nextDueDate?: string
  status: 'green' | 'red' | 'amber'
  daysAgo?: number
  daysUntilDue?: number
  message: string
  dataSource: string
}

interface SibaState {
  statuses: Record<number, SibaStatus>
  isLoading: boolean
  error: string | null
}

const initialState: SibaState = {
  statuses: {},
  isLoading: false,
  error: null,
}

export const fetchSibaStatusAsync = createAsyncThunk(
  'siba/fetchStatus',
  async (propertyId: number, { rejectWithValue }) => {
    try {
      const { sibaAPI } = await import('../services/siba.api')
      const result = await sibaAPI.getSibaStatus(propertyId)
      console.log('SIBA API Response:', { propertyId, result })
      return result
    } catch (error: any) {
      console.error('SIBA API Error:', error)
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch SIBA status')
    }
  }
)

export const submitSibaAsync = createAsyncThunk(
  'siba/submit',
  async ({ propertyId, reservationId, data }: { propertyId: number, reservationId: number, data?: any }, { rejectWithValue }) => {
    try {
      const { sibaAPI } = await import('../services/siba.api')
      return await sibaAPI.submitSiba(propertyId, reservationId, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit SIBA')
    }
  }
)

export const validateSibaAsync = createAsyncThunk(
  'siba/validate',
  async (reservationId: number, { rejectWithValue }) => {
    try {
      const { sibaAPI } = await import('../services/siba.api')
      return await sibaAPI.validateSiba(reservationId)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to validate SIBA')
    }
  }
)

export const getSibaHistoryAsync = createAsyncThunk(
  'siba/getHistory',
  async (reservationId: number, { rejectWithValue }) => {
    try {
      const { sibaAPI } = await import('../services/siba.api')
      return await sibaAPI.getSibaHistory(reservationId)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get SIBA history')
    }
  }
)

const sibaSlice = createSlice({
  name: 'siba',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSibaStatusAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSibaStatusAsync.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload && action.payload.propertyId) {
          state.statuses[action.payload.propertyId] = action.payload
        } else {
          console.error('Invalid SIBA response payload:', action.payload)
        }
      })
      .addCase(fetchSibaStatusAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(submitSibaAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(submitSibaAsync.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(submitSibaAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(validateSibaAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(validateSibaAsync.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(validateSibaAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = sibaSlice.actions
export default sibaSlice.reducer
