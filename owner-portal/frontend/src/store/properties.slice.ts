import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '../services/apiClient'

export interface Property {
  id: number
  name: string
  address: string
  type: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
  hostkitId: string
  status: 'active' | 'inactive' | 'maintenance'
  images: string[]
  amenities: string[]
  createdAt?: string
  updatedAt?: string
}

interface PropertiesState {
  properties: Property[]
  selectedProperty: Property | null
  isLoading: boolean
  error: string | null
}

const initialState: PropertiesState = {
  properties: [], // Start empty - will be populated from database
  selectedProperty: null,
  isLoading: false,
  error: null,
}

// Async thunk to fetch properties
export const fetchPropertiesAsync = createAsyncThunk(
  'properties/fetchProperties',
  async (_, { rejectWithValue }) => {
    try {
      // Add aggressive cache-busting parameters to ensure fresh data
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const response = await apiClient.get(`/property-management?t=${timestamp}&r=${random}&nocache=true`);
      // Ensure we return the correct format
      if (response && typeof response === 'object') {
        return response;
      }
      // Fallback if response format is unexpected
      return { properties: [], total: 0 };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
    }
  }
);

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setSelectedProperty: (state, action: PayloadAction<Property | null>) => {
      state.selectedProperty = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPropertiesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPropertiesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.properties && Array.isArray(action.payload.properties)) {
          state.properties = action.payload.properties;
        } else {
          state.properties = [];
        }
        state.error = null;
      })
      .addCase(fetchPropertiesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
})

export const { setSelectedProperty, clearError } = propertiesSlice.actions
export default propertiesSlice.reducer


