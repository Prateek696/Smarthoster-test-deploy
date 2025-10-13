import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as propertiesAPI from '../services/properties.api';
import { Property, CreatePropertyData, DashboardMetrics } from '../services/properties.api';

interface PropertyManagementState {
  properties: Property[];
  dashboardMetrics: DashboardMetrics | null;
  selectedProperty: Property | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isTesting: boolean;
  error: string | null;
  hostkitTestResult: any;
}

const initialState: PropertyManagementState = {
  properties: [],
  dashboardMetrics: null,
  selectedProperty: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isTesting: false,
  error: null,
  hostkitTestResult: null,
};

// Async thunks
export const fetchPropertiesAsync = createAsyncThunk(
  'propertyManagement/fetchProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await propertiesAPI.getProperties();
      // Ensure we return the correct format
      if (response && typeof response === 'object') {
        return response;
      }
      // Fallback if response format is unexpected
      return { properties: [], total: 0 };
    } catch (error: any) {
      console.error('Failed to fetch properties:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
    }
  }
);

export const createPropertyAsync = createAsyncThunk(
  'propertyManagement/createProperty',
  async (propertyData: CreatePropertyData, { rejectWithValue }) => {
    try {
      const response = await propertiesAPI.createProperty(propertyData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create property');
    }
  }
);

export const updatePropertyAsync = createAsyncThunk(
  'propertyManagement/updateProperty',
  async ({ propertyId, propertyData }: { propertyId: string; propertyData: Partial<CreatePropertyData> }, { rejectWithValue }) => {
    try {
      console.log('🔍 Redux updatePropertyAsync calling API with:', { propertyId, propertyData: Object.keys(propertyData) });
      const response = await propertiesAPI.updateProperty(propertyId, propertyData);
      console.log('🔍 Redux updatePropertyAsync received response:', response);
      console.log('🔍 Response type:', typeof response);
      return response;
    } catch (error: any) {
      console.error('❌ Redux updatePropertyAsync error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update property');
    }
  }
);

export const deletePropertyAsync = createAsyncThunk(
  'propertyManagement/deleteProperty',
  async (propertyId: string, { rejectWithValue }) => {
    try {
      await propertiesAPI.deleteProperty(propertyId);
      return propertyId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete property');
    }
  }
);

export const testHostkitConnectionAsync = createAsyncThunk(
  'propertyManagement/testHostkitConnection',
  async ({ propertyId }: { propertyId: string }, { rejectWithValue }) => {
    try {
      const response = await propertiesAPI.testHostkitConnection(propertyId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to test Hostkit connection');
    }
  }
);

export const fetchDashboardMetricsAsync = createAsyncThunk(
  'propertyManagement/fetchDashboardMetrics',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await propertiesAPI.getDashboardMetrics(startDate, endDate);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard metrics');
    }
  }
);

const propertyManagementSlice = createSlice({
  name: 'propertyManagement',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearHostkitTestResult: (state) => {
      state.hostkitTestResult = null;
    },
    setSelectedProperty: (state, action: PayloadAction<Property | null>) => {
      state.selectedProperty = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Properties
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
      })
      .addCase(fetchPropertiesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.properties = [];
      })
      
      // Create Property
      .addCase(createPropertyAsync.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPropertyAsync.fulfilled, (state, action) => {
        state.isCreating = false;
        state.properties.unshift(action.payload.property);
        state.hostkitTestResult = action.payload.hostkitTest;
      })
      .addCase(createPropertyAsync.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      
      // Update Property
      .addCase(updatePropertyAsync.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePropertyAsync.fulfilled, (state, action) => {
        state.isUpdating = false;
        console.log('🔍 Redux updatePropertyAsync.fulfilled payload:', action.payload);
        
        // Handle the response structure: { success: true, message: string, property: Property }
        if (action.payload && action.payload.property) {
          const updatedProperty = action.payload.property;
          const index = state.properties.findIndex(p => p._id === updatedProperty._id);
          if (index !== -1) {
            state.properties[index] = updatedProperty;
          }
          if (state.selectedProperty?._id === updatedProperty._id) {
            state.selectedProperty = updatedProperty;
          }
        } else {
          console.error('❌ Invalid payload structure in updatePropertyAsync.fulfilled:', action.payload);
        }
      })
      .addCase(updatePropertyAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      
      // Delete Property
      .addCase(deletePropertyAsync.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deletePropertyAsync.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.properties = state.properties.filter(p => p._id !== action.payload);
        if (state.selectedProperty?._id === action.payload) {
          state.selectedProperty = null;
        }
      })
      .addCase(deletePropertyAsync.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      })
      
      // Test Hostkit Connection
      .addCase(testHostkitConnectionAsync.pending, (state) => {
        state.isTesting = true;
        state.error = null;
      })
      .addCase(testHostkitConnectionAsync.fulfilled, (state, action) => {
        state.isTesting = false;
        state.hostkitTestResult = action.payload;
      })
      .addCase(testHostkitConnectionAsync.rejected, (state, action) => {
        state.isTesting = false;
        state.error = action.payload as string;
      })
      
      // Fetch Dashboard Metrics
      .addCase(fetchDashboardMetricsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetricsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardMetrics = action.payload;
      })
      .addCase(fetchDashboardMetricsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearHostkitTestResult, setSelectedProperty } = propertyManagementSlice.actions;
export default propertyManagementSlice.reducer;
