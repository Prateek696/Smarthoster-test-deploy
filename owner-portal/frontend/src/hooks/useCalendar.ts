import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index';
import { apiClient } from '../services/apiClient';

interface CalendarData {
  bookings: any[];
  blockedDates: any[];
  availableDates: any[];
  result?: any[]; // Raw calendar data from Hostaway
}

interface UseCalendarProps {
  propertyId: number;
  startDate: string;
  endDate: string;
}

export const useCalendar = ({ propertyId, startDate, endDate }: UseCalendarProps) => {
  const [calendarData, setCalendarData] = useState<CalendarData>({
    bookings: [],
    blockedDates: [],
    availableDates: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useSelector((state: RootState) => state.auth);

  const fetchCalendarData = async () => {
    if (!propertyId || !token) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.get(`/calendar/${propertyId}?startDate=${startDate}&endDate=${endDate}`);
      console.log('Calendar API response:', data);
      
      // Ensure the data has the expected structure
      const structuredData = {
        bookings: data.bookings || data.result || [],
        blockedDates: data.blockedDates || [],
        availableDates: data.availableDates || []
      };

      console.log('Structured calendar data:', structuredData);
      setCalendarData(structuredData);
    } catch (err: any) {
      console.error('Calendar fetch error:', err);
      setError(err.message || 'Failed to fetch calendar data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCalendar = async (startDate: string, endDate: string, status: 'blocked' | 'available') => {
    if (!propertyId || !token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.put(`/calendar/${propertyId}`, { startDate, endDate, status });
      
      // Refresh calendar data after update
      await fetchCalendarData();
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update calendar');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookings = async () => {
    // This function is no longer needed as calendar service includes bookings
    // Keeping for backward compatibility but it's a no-op
    return;
  };

  useEffect(() => {
    if (propertyId && startDate && endDate && token) {
      console.log('useCalendar: Fetching calendar data for:', { propertyId, startDate, endDate });
      fetchCalendarData();
      // No need to call fetchBookings separately as calendar service now includes bookings
    }
  }, [propertyId, startDate, endDate, token]);

  return {
    calendarData,
    isLoading,
    error,
    fetchCalendarData,
    updateCalendar,
    fetchBookings
  };
};
