import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { sibaManagerApi, SibaValidationResult, SibaSubmissionResult, BulkSibaDashboard, SibaPropertyData } from '../services/sibaManager.api';

// Async thunks
export const validateSibaSubmissionAsync = createAsyncThunk(
  'sibaManager/validateSubmission',
  async ({ propertyId, reservationData }: { propertyId: number; reservationData: any }) => {
    const response = await sibaManagerApi.validateSibaSubmission(propertyId, reservationData);
    return response.validation;
  }
);

export const sendSibaSubmissionAsync = createAsyncThunk(
  'sibaManager/sendSubmission',
  async ({ propertyId, reservationData }: { propertyId: number; reservationData: any }) => {
    const response = await sibaManagerApi.sendSibaSubmission(propertyId, reservationData);
    return response;
  }
);

export const fetchBulkSibaDashboardAsync = createAsyncThunk(
  'sibaManager/fetchBulkDashboard',
  async () => {
    const response = await sibaManagerApi.getBulkSibaDashboard();
    return response;
  }
);

export const fetchSibaStatusAsync = createAsyncThunk(
  'sibaManager/fetchSibaStatus',
  async (propertyId: number) => {
    const response = await sibaManagerApi.getSibaStatus(propertyId);
    return response.status;
  }
);

export const bulkValidateSibaAsync = createAsyncThunk(
  'sibaManager/bulkValidate',
  async (reservations: any[]) => {
    const response = await sibaManagerApi.bulkValidateSiba(reservations);
    return response.validations;
  }
);

export const bulkSendSibaAsync = createAsyncThunk(
  'sibaManager/bulkSend',
  async (reservations: any[]) => {
    const response = await sibaManagerApi.bulkSendSiba(reservations);
    return response;
  }
);

// State interface
interface SibaManagerState {
  // Validation state
  validation: {
    isLoading: boolean;
    result: SibaValidationResult | null;
    error: string | null;
  };
  
  // Submission state
  submission: {
    isLoading: boolean;
    result: SibaSubmissionResult | null;
    error: string | null;
  };
  
  // Bulk dashboard state
  bulkDashboard: {
    isLoading: boolean;
    data: SibaPropertyData[];
    summary: BulkSibaDashboard['summary'] | null;
    error: string | null;
  };
  
  // Individual property status
  propertyStatuses: Record<number, any>;
  
  // Bulk operations state
  bulkOperations: {
    validation: {
      isLoading: boolean;
      results: any[] | null;
      error: string | null;
    };
    submission: {
      isLoading: boolean;
      results: any | null;
      error: string | null;
    };
  };
}

// Initial state
const initialState: SibaManagerState = {
  validation: {
    isLoading: false,
    result: null,
    error: null
  },
  submission: {
    isLoading: false,
    result: null,
    error: null
  },
  bulkDashboard: {
    isLoading: false,
    data: [],
    summary: null,
    error: null
  },
  propertyStatuses: {},
  bulkOperations: {
    validation: {
      isLoading: false,
      results: null,
      error: null
    },
    submission: {
      isLoading: false,
      results: null,
      error: null
    }
  }
};

// Slice
const sibaManagerSlice = createSlice({
  name: 'sibaManager',
  initialState,
  reducers: {
    clearValidation: (state) => {
      state.validation = {
        isLoading: false,
        result: null,
        error: null
      };
    },
    clearSubmission: (state) => {
      state.submission = {
        isLoading: false,
        result: null,
        error: null
      };
    },
    clearBulkDashboard: (state) => {
      state.bulkDashboard = {
        isLoading: false,
        data: [],
        summary: null,
        error: null
      };
    },
    clearBulkOperations: (state) => {
      state.bulkOperations = {
        validation: {
          isLoading: false,
          results: null,
          error: null
        },
        submission: {
          isLoading: false,
          results: null,
          error: null
        }
      };
    }
  },
  extraReducers: (builder) => {
    // Validation
    builder
      .addCase(validateSibaSubmissionAsync.pending, (state) => {
        state.validation.isLoading = true;
        state.validation.error = null;
      })
      .addCase(validateSibaSubmissionAsync.fulfilled, (state, action: PayloadAction<SibaValidationResult>) => {
        state.validation.isLoading = false;
        state.validation.result = action.payload;
      })
      .addCase(validateSibaSubmissionAsync.rejected, (state, action) => {
        state.validation.isLoading = false;
        state.validation.error = action.error.message || 'Validation failed';
      });

    // Submission
    builder
      .addCase(sendSibaSubmissionAsync.pending, (state) => {
        state.submission.isLoading = true;
        state.submission.error = null;
      })
      .addCase(sendSibaSubmissionAsync.fulfilled, (state, action: PayloadAction<SibaSubmissionResult>) => {
        state.submission.isLoading = false;
        state.submission.result = action.payload;
      })
      .addCase(sendSibaSubmissionAsync.rejected, (state, action) => {
        state.submission.isLoading = false;
        state.submission.error = action.error.message || 'Submission failed';
      });

    // Bulk Dashboard
    builder
      .addCase(fetchBulkSibaDashboardAsync.pending, (state) => {
        state.bulkDashboard.isLoading = true;
        state.bulkDashboard.error = null;
      })
      .addCase(fetchBulkSibaDashboardAsync.fulfilled, (state, action: PayloadAction<BulkSibaDashboard>) => {
        state.bulkDashboard.isLoading = false;
        state.bulkDashboard.data = action.payload.data;
        state.bulkDashboard.summary = action.payload.summary;
      })
      .addCase(fetchBulkSibaDashboardAsync.rejected, (state, action) => {
        state.bulkDashboard.isLoading = false;
        state.bulkDashboard.error = action.error.message || 'Failed to fetch dashboard';
      });

    // Property Status
    builder
      .addCase(fetchSibaStatusAsync.fulfilled, (state, action: PayloadAction<any>) => {
        const propertyId = (action as any).meta?.arg;
        if (propertyId) {
          state.propertyStatuses[propertyId] = action.payload;
        }
      });

    // Bulk Validation
    builder
      .addCase(bulkValidateSibaAsync.pending, (state) => {
        state.bulkOperations.validation.isLoading = true;
        state.bulkOperations.validation.error = null;
      })
      .addCase(bulkValidateSibaAsync.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.bulkOperations.validation.isLoading = false;
        state.bulkOperations.validation.results = action.payload;
      })
      .addCase(bulkValidateSibaAsync.rejected, (state, action) => {
        state.bulkOperations.validation.isLoading = false;
        state.bulkOperations.validation.error = action.error.message || 'Bulk validation failed';
      });

    // Bulk Submission
    builder
      .addCase(bulkSendSibaAsync.pending, (state) => {
        state.bulkOperations.submission.isLoading = true;
        state.bulkOperations.submission.error = null;
      })
      .addCase(bulkSendSibaAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.bulkOperations.submission.isLoading = false;
        state.bulkOperations.submission.results = action.payload;
      })
      .addCase(bulkSendSibaAsync.rejected, (state, action) => {
        state.bulkOperations.submission.isLoading = false;
        state.bulkOperations.submission.error = action.error.message || 'Bulk submission failed';
      });
  }
});

export const { clearValidation, clearSubmission, clearBulkDashboard, clearBulkOperations } = sibaManagerSlice.actions;
export default sibaManagerSlice.reducer;
