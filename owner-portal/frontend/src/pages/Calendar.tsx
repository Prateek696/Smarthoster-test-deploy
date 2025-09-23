import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import BookingCalendar from '../components/calendar/BookingCalendar';
import { fetchPropertiesAsync } from '../store/properties.slice';
import usePropertyRefresh from '../hooks/usePropertyRefresh';

const Calendar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const [calendarProps, setCalendarProps] = useState({
    propertyId: undefined as number | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined
  });

  // Get authentication state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Fetch properties on component mount when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPropertiesAsync());
    }
  }, [dispatch, isAuthenticated]);
  
  // Listen for property deletion events to refresh property lists
  usePropertyRefresh();

  // Handle URL parameters for property-specific navigation
  useEffect(() => {
    const propertyId = searchParams.get('propertyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period');

    if (propertyId || startDate || endDate) {
      setCalendarProps({
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
    }

    // Show a notification about the applied filters
    if (period) {
      const periodText = period === 'thisMonth' ? 'this month' : 
                        period === 'lastMonth' ? 'last month' : period;
      console.log(`Applied ${periodText} calendar filters for property ${propertyId}`);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header - Fixed */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm fixed top-16 left-0 right-0 z-20 lg:left-64">
        <div className="container mx-auto px-4 py-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Property Calendar</h1>
            <p className="text-lg text-gray-600">
              Manage your property availability and view bookings
              {calendarProps.propertyId && ` for Property ${calendarProps.propertyId}`}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pt-48">
        {/* Calendar Section */}
        <div>
          <BookingCalendar 
            propertyId={calendarProps.propertyId}
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
