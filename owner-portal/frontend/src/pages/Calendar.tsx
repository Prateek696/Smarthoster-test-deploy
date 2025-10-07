import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLanguage } from '../contexts/LanguageContext';
import { AppDispatch, RootState } from '../store';
import BookingCalendar from '../components/calendar/BookingCalendar';
import { fetchPropertiesAsync } from '../store/properties.slice';
import usePropertyRefresh from '../hooks/usePropertyRefresh';
import PropertySelector from '../components/common/PropertySelector';

const Calendar: React.FC = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const [calendarProps, setCalendarProps] = useState({
    propertyId: undefined as number | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined
  });

  // Get authentication state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { properties } = useSelector((state: RootState) => state.properties);

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

      <div className="container mx-auto px-4 py-1 pt-8">
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
