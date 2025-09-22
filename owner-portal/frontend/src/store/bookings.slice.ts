import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface Booking {
  id: string
  propertyId: number
  propertyName: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  arrivalDate?: string
  departureDate?: string
  nights: number
  adults: number
  children: number
  totalPrice: number
  commission: number
  cleaningFee: number
  status: 'confirmed' | 'cancelled' | 'pending' | 'completed' | 'modified'
  paymentStatus?: 'Paid' | 'Pending' | 'Failed' | 'Refunded'
  platform: string
  provider?: string
  createdAt: string
  updatedAt: string
}

interface BookingsState {
  bookings: Booking[]
  isLoading: boolean
  error: string | null
  filters: {
    propertyId?: number
    status?: string
    dateRange?: {
      start: string
      end: string
    }
  }
}

const initialState: BookingsState = {
  bookings: [],
  isLoading: false,
  error: null,
  filters: {}
}

export const fetchBookingsAsync = createAsyncThunk(
  'bookings/fetchBookings',
  async (params: { propertyId?: number; startDate?: string; endDate?: string }, { rejectWithValue }) => {
    try {
      const { bookingsAPI } = await import('../services/bookings.api')
      const result = await bookingsAPI.getBookings(params)
      
      // Tag each booking with the property ID it was fetched for
      const bookings = Array.isArray(result) ? result : (result as any).bookings || []
      const taggedBookings = bookings.map((booking: any) => ({
        ...booking,
        propertyId: params.propertyId // Tag with the property ID used for the API call
      }))
      
      // Return in the same format as the original response
      return Array.isArray(result) ? taggedBookings : { ...(result as any), bookings: taggedBookings }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch bookings')
    }
  }
)

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<BookingsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingsAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBookingsAsync.fulfilled, (state, action) => {
        state.isLoading = false
        // Handle both array response and object with bookings property
        state.bookings = Array.isArray(action.payload) 
          ? action.payload 
          : action.payload.bookings || []
      })
      .addCase(fetchBookingsAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setFilters, setBookings, clearError } = bookingsSlice.actions
export default bookingsSlice.reducer
