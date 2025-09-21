import { apiClient } from './apiClient';

// SIBA Manager API Client
export const sibaManagerApi = {
  // Validate SIBA submission for a reservation
  validateSibaSubmission: async (propertyId: number, reservationData: any) => {
    try {
      const response = await apiClient.post('/siba-manager/validate', {
        propertyId,
        reservationData
      });
      return response;
    } catch (error: any) {
      console.error('SIBA validation error:', error);
      throw new Error(error.response?.data?.error || 'SIBA validation failed');
    }
  },

  // Send SIBA submission for a reservation
  sendSibaSubmission: async (propertyId: number, reservationData: any) => {
    try {
      const response = await apiClient.post('/siba-manager/send', {
        propertyId,
        reservationData
      });
      return response;
    } catch (error: any) {
      console.error('SIBA submission error:', error);
      throw new Error(error.response?.data?.error || 'SIBA submission failed');
    }
  },

  // Get bulk SIBA dashboard with due/overdue flags
  getBulkSibaDashboard: async () => {
    try {
      const response = await apiClient.get('/siba-manager/dashboard');
      return response;
    } catch (error: any) {
      console.error('Bulk SIBA dashboard error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch SIBA dashboard');
    }
  },

  // Get SIBA status for a specific property
  getSibaStatus: async (propertyId: number) => {
    try {
      const response = await apiClient.get(`/siba-manager/status/${propertyId}`);
      return response;
    } catch (error: any) {
      console.error('SIBA status error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch SIBA status');
    }
  },

  // Bulk validate multiple reservations for SIBA
  bulkValidateSiba: async (reservations: any[]) => {
    try {
      const response = await apiClient.post('/siba-manager/bulk-validate', {
        reservations
      });
      return response;
    } catch (error: any) {
      console.error('Bulk SIBA validation error:', error);
      throw new Error(error.response?.data?.error || 'Bulk SIBA validation failed');
    }
  },

  // Bulk send SIBA submissions for multiple reservations
  bulkSendSiba: async (reservations: any[]) => {
    try {
      const response = await apiClient.post('/siba-manager/bulk-send', {
        reservations
      });
      return response;
    } catch (error: any) {
      console.error('Bulk SIBA submission error:', error);
      throw new Error(error.response?.data?.error || 'Bulk SIBA submission failed');
    }
  }
};

// Types for SIBA Manager
export interface SibaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validationData?: {
    propertyId: number;
    guestCount: number;
    nights: number;
    checkIn: string;
    checkOut: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
  };
}

export interface SibaSubmissionResult {
  success: boolean;
  submissionId?: string;
  sibaData?: any;
  response?: any;
  errors?: string[];
}

export interface SibaPropertyData {
  propertyId: number;
  propertyName: string;
  sibaStatus: 'green' | 'amber' | 'red' | 'error';
  lastSubmission: string | null;
  nextDue: string | null;
  daysUntilDue: number | null;
  totalReservations: number;
  pendingSubmissions: number;
  overdueSubmissions: number;
  complianceRate: number;
  flags: string[];
}

export interface BulkSibaDashboard {
  success: boolean;
  data: SibaPropertyData[];
  summary: {
    totalProperties: number;
    overdue: number;
    dueSoon: number;
    compliant: number;
    errors: number;
  };
}
