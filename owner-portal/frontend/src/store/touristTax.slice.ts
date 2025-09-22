import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface CityTaxData {
  propertyId: number
  startDate: string
  endDate: string
  // City Tax Report Data (matching Hostkit format)
  cityTaxCalculated: number
  cityTaxCalculatedFormatted: string
  cityTaxNights: number
  childrenNights: number
  nightsBeyond: number
  totalNights: number
  hostkitTotalNights: number
  cityTaxInvoiced: number
  cityTaxInvoicedFormatted: string
  cityTaxInvoicedNights: number
  // Legacy fields for compatibility
  totalTax: number
  totalTaxFormatted: string
  totalBookings: number
  totalGuests: number
  adultNights: number
  exemptNights: number
  taxableNights: number
  averageTaxPerNight: number
  averageTaxPerNightFormatted: string
  averageTaxPerGuest: number
  averageTaxPerGuestFormatted: string
  bookingsPlatforms: { [key: string]: number }
  taxStatus: string
  dataSource: string
  futureReady: boolean
  currency: string
}

interface TouristTaxState {
  data: CityTaxData | null
  isLoading: boolean
  error: string | null
  dashboardData: any | null
  dashboardLoading: boolean
  dashboardError: string | null
}

const initialState: TouristTaxState = {
  data: null,
  isLoading: false,
  error: null,
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,
}

export const fetchCityTaxAsync = createAsyncThunk(
  'cityTax/fetchData',
  async (params: { propertyId: number; startDate: string; endDate: string; filterType?: 'checkin' | 'checkout' }, { rejectWithValue }) => {
    try {
      const { touristTaxAPI } = await import('../services/touristTax.api')
      const response = await touristTaxAPI.getTouristTax(params)
      return response
    } catch (error: any) {
      console.error('Redux: Error fetching city tax:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch city tax data')
    }
  }
)

// COMMENTED OUT - City Tax Dashboard removed per user request
/*
export const fetchCityTaxDashboardAsync = createAsyncThunk(
  'cityTax/fetchDashboard',
  async (params: { startDate: string; endDate: string; filterType?: 'checkin' | 'checkout' }, { rejectWithValue }) => {
    try {
      const { cityTaxAPI } = await import('../services/cityTax.api')
      const response = await cityTaxAPI.getCityTaxDashboard(params)
      return response
    } catch (error: any) {
      console.error('Redux Dashboard: Error fetching:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch city tax dashboard')
    }
  }
)
*/

const touristTaxSlice = createSlice({
  name: 'touristTax',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCityTaxAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCityTaxAsync.fulfilled, (state, action) => {
        console.log('City Tax API Response:', action.payload)
        state.isLoading = false
        state.data = action.payload.totalTax
        console.log('Redux State Updated:', state.data)
      })
      .addCase(fetchCityTaxAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // COMMENTED OUT - City Tax Dashboard removed per user request
      // .addCase(fetchCityTaxDashboardAsync.pending, (state) => {
      //   state.dashboardLoading = true
      //   state.dashboardError = null
      // })
      // .addCase(fetchCityTaxDashboardAsync.fulfilled, (state, action) => {
      //   state.dashboardLoading = false
      //   state.dashboardData = action.payload
      // })
      // .addCase(fetchCityTaxDashboardAsync.rejected, (state, action) => {
      //   state.dashboardLoading = false
      //   state.dashboardError = action.payload as string
      // })
  },
})

export const { clearError } = touristTaxSlice.actions
export default touristTaxSlice.reducer
