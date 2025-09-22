import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index';

interface PerformanceData {
  listingId: number;
  month: string;
  dateStart: string;
  dateEnd: string;
  grossRevenue: number;
  commissionPercent: number;
  commissionTotal: number;
  cleaningFees: number;
  netPayout: number;
  bookingCount: number;
  invoiceTotal: number;
  hostawayReservations: any[];
  hostkitReservations: any[];
  invoices: any[];
}

interface UsePerformanceProps {
  propertyId: number;
  month: string; // Format: YYYY-MM
}

export const usePerformance = ({ propertyId, month }: UsePerformanceProps) => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useSelector((state: RootState) => state.auth);

  const fetchPerformanceData = async () => {
    if (!propertyId || !month || !token) {

      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {

      const response = await fetch(`/api/performance/${propertyId}?month=${month}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Performance API error:', response.status, errorText);
        throw new Error(`Failed to fetch performance data: ${response.status}`);
      }

      const data = await response.json();

      setPerformanceData(data);
    } catch (err: any) {
      console.error('Performance fetch error:', err);
      setError(err.message || 'Failed to fetch performance data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    fetchPerformanceData();
  };

  useEffect(() => {
    if (propertyId && month) {
      fetchPerformanceData();
    }
  }, [propertyId, month]);

  return {
    performanceData,
    isLoading,
    error,
    refreshData
  };
};
