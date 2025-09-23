import React, { useState, useEffect } from 'react';
import { Calendar, CalendarDays, X, Check, AlertCircle, ChevronLeft, ChevronRight, Euro, Clock, Edit, Lock, Building2 } from 'lucide-react';
import { useCalendar } from '../../hooks/useCalendar';
import PropertySelector from '../common/PropertySelector';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import { fetchPropertiesAsync } from '../../store/propertyManagement.slice';
import { getCalendarDateData, updateCalendarPricing, updateCalendarMinimumStay, getCalendarMonthPricing, updateCalendarAvailability, updateCalendarStatus } from '../../services/calendar.api';
import { canUpdateCalendar } from '../../utils/roleUtils';

interface BookingCalendarProps {
  propertyId?: number;
  onDateSelect?: (date: string) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  propertyId: initialPropertyId,
  onDateSelect 
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Helper function to format date in local timezone (fixes timezone offset bug)
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(initialPropertyId || null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<{ start: string; end: string } | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [doubleClickMode, setDoubleClickMode] = useState(false);
  const [selectedDateList, setSelectedDateList] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [hoverMode, setHoverMode] = useState(false);
  const [clickTimeout, setClickTimeout] = useState<number | null>(null);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [calendarDateData, setCalendarDateData] = useState<any>(null);
  const [isLoadingDateData, setIsLoadingDateData] = useState(false);
  const [monthlyPricingData, setMonthlyPricingData] = useState<{[key: string]: {price: number, minimumStay: number, status: string}}>({});
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  
  // Edit form state
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editMinimumStay, setEditMinimumStay] = useState<number>(1);
  const [showEditForm, setShowEditForm] = useState(false);

  // Calculate date range for current month view with buffer for cross-month bookings
  const startDate = formatDateLocal(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const endDate = formatDateLocal(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0));

  const { token } = useSelector((state: RootState) => state.auth);
  const properties = useSelector((state: RootState) => state.propertyManagement.properties);
  
  // Fetch properties on component mount
  useEffect(() => {
    if (properties.length === 0) {
      dispatch(fetchPropertiesAsync() as any);
    }
  }, [dispatch, properties.length]);

  
  const { calendarData, isLoading, error, updateCalendar, fetchCalendarData } = useCalendar({
    propertyId: selectedPropertyId as number,
    startDate,
    endDate
  });

  // Auto-select first property if none selected and properties are available
  useEffect(() => {
    if (properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  // Ensure calendarData has the required properties
  const safeCalendarData = {
    bookings: calendarData?.bookings || [],
    blockedDates: calendarData?.blockedDates || [],
    availableDates: calendarData?.availableDates || [],
    calendar: calendarData?.result || [] // Raw calendar data from Hostaway
  };
  




  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // Fetch pricing data for the current month
  const fetchMonthlyPricingData = async () => {
    if (!selectedPropertyId) return;
    
    try {
      setIsLoadingPricing(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      console.log('Fetching monthly pricing data:', { selectedPropertyId, year, month });
      
      // Use the new monthly pricing endpoint
      const pricingData = await getCalendarMonthPricing(selectedPropertyId, year, month);
      
      console.log('Received monthly pricing data:', pricingData);
      console.log('Sample pricing data keys:', Object.keys(pricingData).slice(0, 5));
      console.log('Sample pricing data values:', Object.values(pricingData).slice(0, 3));
      setMonthlyPricingData(pricingData);
    } catch (error) {
      console.error('Failed to fetch monthly pricing data:', error);
      
      // Check if it's an authentication error
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 401) {
        console.error('Authentication failed - token may be expired. Please refresh the page.');
        // Show a message to the user
        alert('Your session has expired. Please refresh the page to continue.');
        return;
      }
      
      // Fallback: create default pricing data for the month
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const lastDay = new Date(year, month + 1, 0);
      
      const fallbackData: {[key: string]: {price: number, minimumStay: number, status: string}} = {};
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dateStr = formatDateLocal(date);
        fallbackData[dateStr] = {
          price: 289,
          minimumStay: 2,
          status: 'available'
        };
      }
      
      setMonthlyPricingData(fallbackData);
    } finally {
      setIsLoadingPricing(false);
    }
  };

  // Fetch pricing data when month or property changes
  useEffect(() => {
    fetchMonthlyPricingData();
  }, [currentMonth, selectedPropertyId]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  const handleDateClick = async (date: Date) => {
    // Check if user can update calendar
    if (!canUpdateCalendar(user?.role || null)) {
      alert('Only owners can manage calendar dates. You can view the calendar but cannot make changes.');
      return;
    }

    const dateStr = formatDateLocal(date);

    // If we have any selected dates, handle selection
    if (selectedDateList.length > 0 || doubleClickMode) {
      if (selectedDateList.includes(dateStr)) {
        // Clicked on selected date - just stop hover mode (keep date selected)
        setHoverMode(false);
        setIsSelecting(false); // Stop active selection
        console.log('Stopped hover mode, date remains selected:', dateStr);
      } else {
        // Add to selection and enable hover mode
        setSelectedDateList(prev => [...prev, dateStr]);
        setDoubleClickMode(true);
        setShowBulkActions(true);
        setHoverMode(true); // Enable hover mode
        setIsSelecting(true); // Start active selection
        console.log('Added date to selection and enabled hover mode:', dateStr);
      }
      return; // Don't open modal in selection mode
    }

    // Normal click mode: open date modal
    setClickedDate(date);
    setShowDateModal(true);
    setIsLoadingDateData(true);
    
    try {
      // Fetch real calendar data from Hostaway
      const dateStr = formatDateLocal(date);
      const data = await getCalendarDateData(selectedPropertyId || 392776, dateStr);
      setCalendarDateData(data);
      
      // Set edit form values
      setEditPrice(data.price || 0);
      setEditMinimumStay(data.minimumStay || 1);
    } catch (error) {
      console.error('Failed to fetch calendar date data:', error);
      // Set default values if API fails
      setCalendarDateData({
        date: formatDateLocal(date),
        status: 'available',
        price: null,
        minimumStay: null,
        checkInAvailable: true,
        checkOutAvailable: true
      });
    } finally {
      setIsLoadingDateData(false);
    }
    
    // Also update selected dates for range selection
    if (!selectedDates) {
      setSelectedDates({ start: formatDateLocal(date), end: formatDateLocal(date) });
    } else {
      const start = new Date(selectedDates.start);
      const end = new Date(selectedDates.end);
      const clicked = date;

      if (clicked < start) {
        setSelectedDates({ start: formatDateLocal(clicked), end: selectedDates.end });
      } else if (clicked > end) {
        setSelectedDates({ start: selectedDates.start, end: formatDateLocal(clicked) });
      } else {
        setSelectedDates(null);
      }
    }
  };

  const handleDateDoubleClick = (date: Date) => {
    console.log('Double-click detected!', date);
    
    if (!canUpdateCalendar(user?.role || null)) {
      alert('Only owners can manage calendar dates. You can view the calendar but cannot make changes.');
      return;
    }

    const dateStr = formatDateLocal(date);
    
    if (selectedDateList.includes(dateStr)) {
      // Double-clicked on selected date - remove it from selection
      const newList = selectedDateList.filter(d => d !== dateStr);
      setSelectedDateList(newList);
      setHoverMode(false); // Stop hover mode
      
      if (newList.length === 0) {
        // No more selected dates - exit selection mode completely
        setDoubleClickMode(false);
        setShowBulkActions(false);
      }
      console.log('Removed date from selection via double-click:', dateStr);
    } else {
      // Double-clicked on unselected date - start new selection
      console.log('Entering double-click mode for date:', dateStr);
      setDoubleClickMode(true);
      setSelectedDateList([dateStr]);
      setShowBulkActions(true);
      setHoverMode(true); // Enable hover mode
      setIsSelecting(true); // Start active selection
    }
  };

  const handleDateHover = (date: Date) => {
    // Only add dates via hover if we're actively selecting (not just in hover mode)
    if (hoverMode && selectedDateList.length > 0 && isSelecting) {
      const dateStr = formatDateLocal(date);
      if (!selectedDateList.includes(dateStr)) {
        setSelectedDateList(prev => [...prev, dateStr]);
        console.log('Added date via hover:', dateStr);
      }
    }
  };

  const exitDoubleClickMode = () => {
    setDoubleClickMode(false);
    setSelectedDateList([]);
    setShowBulkActions(false);
    setHoverMode(false); // Disable hover mode
    setSelectionStart(null);
    setSelectionEnd(null);
    setIsSelecting(false);
  };

  const handleBulkBlock = async () => {
    if (!selectedPropertyId || selectedDateList.length === 0) return;
    
    setIsBlocking(true);
    try {
      // Block each date individually
      for (const dateStr of selectedDateList) {
        await updateCalendarAvailability(selectedPropertyId, dateStr, dateStr, 0); // 0 = Block
        console.log(`Blocked date: ${dateStr}`);
      }
      console.log('All dates blocked successfully');
      exitDoubleClickMode();
      // Refresh calendar data without losing current month
      fetchCalendarData();
    } catch (error) {
      console.error('Failed to block dates:', error);
    } finally {
      setIsBlocking(false);
    }
  };

  const handleBulkUnblock = async () => {
    console.log('🚀 handleBulkUnblock called with:', { selectedPropertyId, selectedDateList });
    if (!selectedPropertyId || selectedDateList.length === 0) {
      console.log('❌ Missing propertyId or no dates selected');
      return;
    }
    
    setIsBlocking(true);
    try {
      // Unblock each date individually
      for (const dateStr of selectedDateList) {
        console.log(`🔄 Unblocking date: ${dateStr}`);
        const result = await updateCalendarAvailability(selectedPropertyId, dateStr, dateStr, 1); // 1 = Unblock
        console.log(`✅ Unblocked date: ${dateStr}`, result);
      }
      console.log('🎉 All dates unblocked successfully');
      exitDoubleClickMode();
      // Wait a moment for backend to process, then refresh calendar data
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchCalendarData();
      console.log('📊 Calendar data refreshed after unblock');
    } catch (error) {
      console.error('❌ Failed to unblock dates:', error);
    } finally {
      setIsBlocking(false);
    }
  };

  const handleBlockDates = async () => {
    if (!selectedDates || !selectedPropertyId) return;
    
    setIsBlocking(true);
    try {
      // Use the same API as single date blocking but for date range
      const result = await updateCalendarAvailability(selectedPropertyId, selectedDates.start, selectedDates.end, 0); // 0 = Block
      console.log('Dates blocked successfully:', result);
      setSelectedDates(null);
      
      // Refresh calendar data
      if (onDateSelect) {
        onDateSelect(selectedDates.start);
      }
      // Refresh calendar data without losing current month
      fetchCalendarData();
    } catch (error) {
      console.error('Failed to block dates:', error);
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockDates = async () => {
    if (!selectedDates || !selectedPropertyId) return;
    
    setIsBlocking(true);
    try {
      // Use the same API as single date unblocking but for date range
      const result = await updateCalendarAvailability(selectedPropertyId, selectedDates.start, selectedDates.end, 1); // 1 = Unblock
      console.log('Dates unblocked successfully:', result);
      setSelectedDates(null);
      
      // Refresh calendar data
      if (onDateSelect) {
        onDateSelect(selectedDates.start);
      }
      // Refresh calendar data without losing current month
      fetchCalendarData();
    } catch (error) {
      console.error('Failed to unblock dates:', error);
    } finally {
      setIsBlocking(false);
    }
  };

  const handleBlockSingleDate = async () => {
    if (!clickedDate || !selectedPropertyId) return;
    
    setIsBlocking(true);
    try {
      // Fix timezone issue by using local date formatting
      const year = clickedDate.getFullYear();
      const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
      const day = String(clickedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      console.log('Blocking date:', { clickedDate, dateStr });
      const result = await updateCalendarAvailability(selectedPropertyId, dateStr, dateStr, 0); // 0 = Block
      console.log('Date blocked successfully:', result);
      setShowDateModal(false);
      // Refresh calendar data
      if (onDateSelect) {
        onDateSelect(dateStr);
      }
      // Refresh calendar data without losing current month
      fetchCalendarData();
    } catch (error) {
      console.error('Failed to block date:', error);
      alert('Failed to block date. Please try again.');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockSingleDate = async () => {
    console.log('🚀 handleUnblockSingleDate called with:', { clickedDate, selectedPropertyId });
    if (!clickedDate || !selectedPropertyId) {
      console.log('❌ Missing clickedDate or selectedPropertyId');
      return;
    }
    
    setIsBlocking(true);
    try {
      // Fix timezone issue by using local date formatting
      const year = clickedDate.getFullYear();
      const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
      const day = String(clickedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      console.log('🔄 Unblocking single date:', { clickedDate, dateStr });
      const result = await updateCalendarAvailability(selectedPropertyId, dateStr, dateStr, 1); // 1 = Unblock
      console.log('✅ Date unblocked successfully:', result);
      setShowDateModal(false);
      // Refresh calendar data
      if (onDateSelect) {
        onDateSelect(dateStr);
      }
      // Wait a moment for backend to process, then refresh calendar data
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchCalendarData();
      console.log('📊 Calendar data refreshed after single unblock');
    } catch (error) {
      console.error('❌ Failed to unblock date:', error);
      alert('Failed to unblock date. Please try again.');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUpdatePricing = async () => {
    if (!clickedDate || !selectedPropertyId) return;
    
    setIsBlocking(true);
    try {
      const dateStr = formatDateLocal(clickedDate);
      await updateCalendarPricing(selectedPropertyId, {
        startDate: dateStr,
        endDate: dateStr,
        price: editPrice
      });
      
      // Refresh the calendar data
      const data = await getCalendarDateData(selectedPropertyId, dateStr);
      setCalendarDateData(data);
      
      // Update monthly pricing data
      setMonthlyPricingData(prev => ({
        ...prev,
        [dateStr]: { ...prev[dateStr], price: editPrice }
      }));
      
      setShowEditForm(false);
    } catch (error) {
      console.error('Failed to update pricing:', error);
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUpdateMinimumStay = async () => {
    if (!clickedDate || !selectedPropertyId) return;
    
    setIsBlocking(true);
    try {
      const dateStr = formatDateLocal(clickedDate);
      await updateCalendarMinimumStay(selectedPropertyId, {
        startDate: dateStr,
        endDate: dateStr,
        minimumStay: editMinimumStay
      });
      
      // Refresh the calendar data
      const data = await getCalendarDateData(selectedPropertyId, dateStr);
      setCalendarDateData(data);
      
      // Update monthly pricing data
      setMonthlyPricingData(prev => ({
        ...prev,
        [dateStr]: { ...prev[dateStr], minimumStay: editMinimumStay }
      }));
      
      setShowEditForm(false);
    } catch (error) {
      console.error('Failed to update minimum stay:', error);
    } finally {
      setIsBlocking(false);
    }
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDates) return false;
    const dateStr = formatDateLocal(date);
    return dateStr >= selectedDates.start && dateStr <= selectedDates.end;
  };

  const isDateInSelection = (date: Date) => {
    if (!doubleClickMode) return false;
    
    const dateStr = formatDateLocal(date);
    
    // Check if date is in the final selected list
    if (selectedDateList.includes(dateStr)) return true;
    
    // Check if date is in the current selection range (while selecting or hovering)
    if (isSelecting && selectionStart) {
      const start = formatDateLocal(selectionStart);
      const end = selectionEnd ? formatDateLocal(selectionEnd) : dateStr;
      
      const actualStart = start <= end ? start : end;
      const actualEnd = start <= end ? end : start;
      
      return dateStr >= actualStart && dateStr <= actualEnd;
    }
    
    return false;
  };

  const isDateBlocked = (date: Date) => {
    // Fix timezone issue by using local date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Debug: Log what we're checking
    console.log('Checking if date is blocked:', dateStr, {
      blockedDates: safeCalendarData.blockedDates,
      bookings: safeCalendarData.bookings
    });
    
    // Check if date is in blockedDates array (real Hostaway API data)
    if (Array.isArray(safeCalendarData.blockedDates)) {
      const isBlocked = safeCalendarData.blockedDates.some((blocked: any) => {
        // Check single date
        if (blocked.date === dateStr) {
          return blocked.status === 'unavailable' || blocked.status === 'blocked';
        }
        // Check date ranges
        if (blocked.startDate && blocked.endDate) {
          const start = new Date(blocked.startDate);
          const end = new Date(blocked.endDate);
          const checkDate = new Date(dateStr);
          return checkDate >= start && checkDate <= end && 
                 (blocked.status === 'unavailable' || blocked.status === 'blocked');
        }
        return false;
      });
      
      if (isBlocked) {
        console.log(`Date ${dateStr} is blocked via blockedDates`);
        return true;
      }
    }
    
    // Also check the result array from Hostaway API
    if (Array.isArray(safeCalendarData.bookings)) {
      const isBlocked = safeCalendarData.bookings.some((item: any) => {
        if (item.date === dateStr) {
          // Only mark as blocked if explicitly unavailable, not if reserved/booked
          return item.status === 'unavailable' || item.status === 'blocked';
        }
        return false;
      });
      
      if (isBlocked) {
        console.log(`Date ${dateStr} is blocked via result array`);
        return true;
      }
    }
    
    // No temporary test fallbacks - using real API data only
    
    return false;
  };

  const isDateBooked = (date: Date) => {
    // Get date in YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    
    // Check if there's a booking for this date (including departure date)
    // Only show "Modified" status bookings on calendar
    return safeCalendarData.bookings.some(booking => {
      const checkInDate = booking.arrivalDate || booking.checkIn;
      const checkOutDate = booking.departureDate || booking.checkOut;
      const status = booking.status || booking.bookingStatus;
      
      // Use proper date comparison instead of string comparison
      const checkInDateObj = new Date(checkInDate);
      const checkOutDateObj = new Date(checkOutDate);
      const currentDateObj = new Date(dateStr);
      
      const isInRange = currentDateObj >= checkInDateObj && currentDateObj <= checkOutDateObj;
      const hasValidStatus = status === 'Modified' || status === 'Confirmed' || status === 'Paid';
      
      
      // Include departure date in booking span and filter by status
      return isInRange && hasValidStatus;
    });
  };

  // Pricing functions removed as requested

  const getTimePeriod = (timeString: string) => {
    if (!timeString) return 'morning';
    const hour = parseInt(timeString.split(':')[0]);
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  const getBookingForDate = (date: Date) => {
    // Get date in YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Find booking that matches this exact date (including departure date)
    // Only show "Modified" status bookings on calendar
    if (Array.isArray(safeCalendarData.bookings)) {
      const booking = safeCalendarData.bookings.find((booking: any) => {
        const checkInDate = booking.arrivalDate || booking.checkIn;
        const checkOutDate = booking.departureDate || booking.checkOut;
        const status = booking.status || booking.bookingStatus;
        
        // Use proper date comparison instead of string comparison
        const checkInDateObj = new Date(checkInDate);
        const checkOutDateObj = new Date(checkOutDate);
        const currentDateObj = new Date(dateStr);
        
        // Only show Modified status bookings on calendar
        return (currentDateObj >= checkInDateObj && currentDateObj <= checkOutDateObj) && 
               (status === 'Modified' || status === 'Confirmed' || status === 'Paid');
      });
      
      if (booking) {
        return {
          guestName: booking.guestName || 'Guest',
          guestCount: (booking.adults || 0) + (booking.children || 0),
          isCheckInDay: dateStr === (booking.arrivalDate || booking.checkIn),
          isCheckOutDay: dateStr === (booking.departureDate || booking.checkOut),
          checkInTime: booking.checkInTime || '16:00',
          checkOutTime: booking.checkOutTime || '11:00'
        };
      }
    }
    
    return null;
  };

  const getBookingsForDate = (date: Date) => {
    // Get date in YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    
    // Find all bookings for this date (check-in, check-out, or staying)
    // Only show "Modified" status bookings on calendar
    if (Array.isArray(safeCalendarData.bookings)) {
      return safeCalendarData.bookings.filter((booking: any) => {
        const checkInDate = booking.arrivalDate || booking.checkIn;
        const checkOutDate = booking.departureDate || booking.checkOut;
        const status = booking.status || booking.bookingStatus;
        
        // Only show Modified status bookings on calendar
        const checkInDateObj = new Date(checkInDate);
        const checkOutDateObj = new Date(checkOutDate);
        const currentDateObj = new Date(dateStr);
        
        return (currentDateObj.getTime() === checkInDateObj.getTime() || 
               currentDateObj.getTime() === checkOutDateObj.getTime() || 
               (currentDateObj > checkInDateObj && currentDateObj < checkOutDateObj)) &&
               (status === 'Modified' || status === 'Confirmed' || status === 'Paid');
      }).map(booking => {
        const checkInDate = booking.arrivalDate || booking.checkIn;
        const checkOutDate = booking.departureDate || booking.checkOut;
        const checkInDateObj = new Date(checkInDate);
        const checkOutDateObj = new Date(checkOutDate);
        const currentDateObj = new Date(dateStr);
        
        const result = {
          guestName: booking.guestName || 'Guest',
          guestCount: (booking.adults || 0) + (booking.children || 0),
          isCheckInDay: currentDateObj.getTime() === checkInDateObj.getTime(),
          isCheckOutDay: currentDateObj.getTime() === checkOutDateObj.getTime(),
          checkInTime: booking.checkInTime || '16:00',
          checkOutTime: booking.checkOutTime || '11:00',
          isStaying: currentDateObj > checkInDateObj && currentDateObj < checkOutDateObj
        };
        
        
        return result;
      });
    }
    
    return [];
  };

  // Removed unused functions getBookingSpanInfo and getBookingLineInfo

  const getCleaningWindow = (date: Date) => {
    const dateStr = formatDateLocal(date);
    
    // Check if this date is in a cleaning window between bookings
    if (Array.isArray(safeCalendarData.bookings)) {
      const sortedBookings = safeCalendarData.bookings.sort((a: any, b: any) => 
        new Date(a.arrivalDate || a.checkIn).getTime() - new Date(b.arrivalDate || b.checkIn).getTime()
      );
      
      for (let i = 0; i < sortedBookings.length - 1; i++) {
        const currentBooking = sortedBookings[i];
        const nextBooking = sortedBookings[i + 1];
        
        const currentCheckOut = new Date(currentBooking.departureDate || currentBooking.checkOut);
        const nextCheckIn = new Date(nextBooking.arrivalDate || nextBooking.checkIn);
        const checkDate = new Date(dateStr);
        
        // Check if this date falls between check-out and next check-in
        if (checkDate > currentCheckOut && checkDate < nextCheckIn) {
          const currentCheckOutTime = currentBooking.checkOutTime || '11:00';
          const nextCheckInTime = nextBooking.checkInTime || '15:00';
          
          return {
            isCleaningWindow: true,
            previousGuest: currentBooking.guestName || 'Guest',
            nextGuest: nextBooking.guestName || 'Guest',
            checkOutTime: currentCheckOutTime,
            checkInTime: nextCheckInTime,
            checkOutPeriod: getTimePeriod(currentCheckOutTime),
            checkInPeriod: getTimePeriod(nextCheckInTime)
          };
        }
      }
    }
    
    return { isCleaningWindow: false };
  };

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days.map((date, dayIndex) => {
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === new Date().toDateString();
      const isBooked = isDateBooked(date);
      const booking = getBookingForDate(date);
      const isBlocked = isDateBlocked(date);
      const isSelected = isDateSelected(date);

      return (
        <div
          key={dayIndex}
          className={`
              relative min-h-[120px] p-0 group
              ${isCurrentMonth ? 'bg-gray-50' : 'bg-gray-100'}
              ${isToday ? 'bg-blue-50' : ''}
              ${isBooked ? 'bg-teal-50' : ''}
              ${isBlocked ? 'bg-red-50' : ''}
              ${isSelected ? 'bg-green-100 border-2 border-green-500' : ''}
              ${isDateInSelection(date) ? 'bg-green-100 border-2 border-green-500' : ''}
              ${(() => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                const pricingInfo = monthlyPricingData[dateStr];
                if (pricingInfo?.status === 'reserved') return 'bg-teal-50';
                if (pricingInfo?.status === 'blocked') return 'bg-red-50';
                return '';
              })()}
            `}
          style={{ 
            overflow: 'visible'
          }}
        >
          {/* Date Number */}
           <div className="flex justify-between items-center mb-2 p-2">
             <span className={`
               text-sm font-medium px-2 py-1 rounded
               ${isCurrentMonth ? 'text-gray-900 bg-gray-200' : 'text-gray-400 bg-gray-100'}
               ${isToday ? 'text-blue-600 bg-blue-100' : ''}
               ${isSelected ? 'text-green-700 bg-green-200 font-bold' : ''}
               ${isBlocked ? 'text-red-800 bg-red-200 font-bold' : ''}
               ${isDateInSelection(date) ? 'text-green-700 bg-green-200 font-bold' : ''}
             `}>
          {date.getDate()}
            </span>
            {/* Blocked indicator */}
            {isBlocked && (
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded font-bold">
                BLOCKED
              </span>
            )}
            {/* Selection indicator - removed to match single selection style */}
          </div>

          {/* Pricing and Minimum Stay Info - Bottom Right */}
          {isCurrentMonth && (() => {
            // Fix timezone issue by using local date formatting
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const pricingInfo = monthlyPricingData[dateStr];
            
            if (isLoadingPricing) {
              return (
                <div className="absolute bottom-1 right-1 px-3 py-2 bg-gray-100 rounded-md text-xs text-gray-400 z-10 shadow-md">
                  Loading...
                </div>
              );
            }
            
            return (
              <div className={`absolute bottom-1 right-1 px-3 py-2 bg-gray-100 rounded-md space-y-1 z-10 shadow-md transition-opacity duration-200 ${
                pricingInfo?.status === 'reserved' ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
              }`}>
                <div className={`text-xs font-semibold ${
                  pricingInfo?.status === 'reserved' ? 'text-teal-700' : 
                  pricingInfo?.status === 'blocked' ? 'text-red-700' : 
                  'text-gray-700'
                }`}>
                  €{pricingInfo?.price || 'N/A'}
                </div>
                <div className="text-xs text-gray-500">
                  {pricingInfo?.minimumStay || 'N/A'} nights min
                </div>
                {pricingInfo?.status === 'reserved' && (
                  <div className="text-xs text-teal-600 font-bold">
                    RESERVED
                  </div>
                )}
                {pricingInfo?.status === 'blocked' && (
                  <div className="text-xs text-red-600 font-bold">
                    BLOCKED
                  </div>
                )}
              </div>
            );
          })()}

          {/* Individual Guest Seamless Lines */}
          {isBooked && (() => {
            const bookings = getBookingsForDate(date);
            
            return (
              <div className="mt-2 relative" style={{ height: '40px' }}>
                {bookings.map((booking, bookingIndex) => {
                  const isCheckIn = booking.isCheckInDay;
                  const isCheckOut = booking.isCheckOutDay;
                  const isStaying = booking.isStaying;
                  
                  // Calculate horizontal space allocation based on check-in/check-out times
                  let height, top, width, left;
                  
                  if (isCheckOut && !isCheckIn) {
                    // Check-out only: 30% width from left (morning departure)
                    height = '40px';
                    top = '0px';
                    width = '30%';
                    left = '0px';
                  } else if (isCheckIn && !isCheckOut) {
                    // Check-in only: 70% width from right (afternoon arrival)
                    height = '40px';
                    top = '0px';
                    width = '70%';
                    left = '30%';
                  } else if (isCheckOut && isCheckIn) {
                    // Same day check-out and check-in: render separate bars
                    return (
                      <>
                        {/* Check-out bar */}
                        <div 
                          key={`${bookingIndex}-checkout`}
                          className="absolute bg-teal-500 flex items-center px-2"
                          style={{
                            left: '-6px',
                            top: '0px',
                            height: '40px',
                            width: '30%',
                            zIndex: 5,
                            borderRadius: '0 6px 6px 0'
                          }}
                        >
                          <div className="flex-1"></div>
                        </div>
                        
                        {/* Check-in bar */}
                        <div 
                          key={`${bookingIndex}-checkin`}
                          className="absolute bg-teal-500 flex items-center px-2"
                          style={{
                            left: '30%',
                            top: '0px',
                            height: '40px',
                            width: '70%',
                            zIndex: 5,
                            borderRadius: '0'
                          }}
                        >
                          <div className="flex items-center space-x-2 flex-1">
                            {/* Guest avatar */}
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {booking.guestName ? booking.guestName.charAt(0).toUpperCase() : 'G'}
                            </div>
                            
                            {/* Guest details */}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-white truncate">
                                {booking.guestName}
                              </div>
                              <div className="text-xs text-teal-100">
                                {booking.guestCount} guests
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  } else {
                    // Staying: full day seamless line
                    height = '40px';
                    top = '0px';
                    width = '100%';
                    left = '0px';
                  }
                  
                  return (
                    <div 
                      key={bookingIndex}
                      className="absolute bg-teal-500 flex items-center px-2"
                      style={{
                        left: left === '0px' ? '-9px' : left,
                        right: left === '0px' ? '-9px' : '0px',
                        top: top,
                        height: height,
                        width: width,
                        zIndex: 10,
                        borderRadius: isCheckIn ? '6px 0 0 6px' : isCheckOut ? '0 6px 6px 0' : '0'
                      }}
                    >
                      {/* Guest info only on check-in days (first day of booking) */}
                      {isCheckIn && (
                        <div className="flex items-center space-x-2 flex-1">
                          {/* Guest avatar */}
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {booking.guestName ? booking.guestName.charAt(0).toUpperCase() : 'G'}
                          </div>
                          
                          {/* Guest details */}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-white truncate">
                              {booking.guestName}
                            </div>
                            <div className="text-xs text-teal-100">
                              {booking.guestCount} guests
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Empty space for check-out only days */}
                      {isCheckOut && !isCheckIn && <div className="flex-1"></div>}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Click Handler */}
          <button
            onClick={() => handleDateClick(date)}
            onDoubleClick={() => handleDateDoubleClick(date)}
            onMouseEnter={() => handleDateHover(date)}
            disabled={!isCurrentMonth || isBooked || !canUpdateCalendar(user?.role || null)}
            className={`absolute inset-0 w-full h-full opacity-0 ${
              canUpdateCalendar(user?.role || null) 
                ? 'cursor-pointer disabled:cursor-not-allowed' 
                : 'cursor-not-allowed'
            } ${doubleClickMode && !isSelecting ? 'bg-green-100 bg-opacity-50' : ''}`}
            title={!canUpdateCalendar(user?.role || null) ? 'Only owners can manage calendar dates' : 
                   doubleClickMode && isSelecting ? 'Click to complete selection or stop selecting' : 
                   doubleClickMode ? 'Click to start selection' : 'Click to manage date, double-click to select multiple'}
          />
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <AlertCircle className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  // Show empty state when no property is selected
  if (!selectedPropertyId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Property Selected</h3>
          <p className="text-gray-500">Please select a property to view its calendar and bookings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold text-gray-900">Property Calendar</h2>
            {!canUpdateCalendar(user?.role || null) && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs">
                <Lock className="h-3 w-3" />
                <span>View Only</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {canUpdateCalendar(user?.role || null) 
              ? 'Manage availability and view bookings' 
              : 'View availability and bookings (read-only)'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <PropertySelector
            properties={properties as any}
            selectedId={selectedPropertyId}
            onChange={setSelectedPropertyId}
          />
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => handleMonthChange('prev')}
          className="p-3 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200 hover:shadow-md"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <h3 className="text-2xl font-bold text-gray-900">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        
        <button
          onClick={() => handleMonthChange('next')}
          className="p-3 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200 hover:shadow-md"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 bg-gray-100 p-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 bg-white rounded-lg border border-gray-200">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-0 bg-gray-100 p-0 rounded-lg">
          {renderCalendarDays()}
        </div>
      </div>

             {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-50 border border-green-300 rounded mr-2"></div>
          <span className="font-medium text-gray-700">Booked</span>
        </div>
         <div className="flex items-center">
          <div className="w-4 h-4 bg-red-50 border border-red-300 rounded mr-2"></div>
          <span className="font-medium text-gray-700">Blocked</span>
         </div>
         <div className="flex items-center">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded mr-2"></div>
          <span className="font-medium text-gray-700">Available</span>
         </div>
         <div className="flex items-center">
          <div className="w-4 h-4 bg-teal-100 border border-teal-300 rounded mr-2"></div>
          <span className="font-medium text-gray-700">Guest Details</span>
         </div>
       </div>


      {/* Date Selection Actions */}
      {selectedDates && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Selected: {selectedDates.start} to {selectedDates.end}
              </p>
              <p className="text-xs text-blue-700">
                Click to block or unblock these dates
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBlockDates}
                disabled={isBlocking}
                className="btn-primary btn-sm"
              >
                {isBlocking ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <X className="h-4 w-4 mr-1" />
                )}
                Block Dates
              </button>
              
              <button
                onClick={handleUnblockDates}
                disabled={isBlocking}
                className="btn-outline btn-sm"
              >
                {isBlocking ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Unblock Dates
              </button>
              
              <button
                onClick={() => setSelectedDates(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Selection Mode Button */}
      {!doubleClickMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-900">
                Multi-Date Selection
              </p>
              <p className="text-xs text-yellow-700">
                Click "Start Selection" → Click start date → Hover to end date → Click end date
              </p>
            </div>
            <button
              onClick={() => {
                setDoubleClickMode(true);
                setSelectedDateList([]);
                setShowBulkActions(false);
                setHoverMode(false); // Start without hover mode
                setSelectionStart(null);
                setSelectionEnd(null);
                setIsSelecting(false);
                console.log('Started selection mode manually');
              }}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
            >
              Start Selection
            </button>
          </div>
        </div>
      )}

      {/* Selection Status */}
      {doubleClickMode && isSelecting && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Selecting Date Range
              </p>
              <p className="text-xs text-blue-700">
                Hover to preview range, then click to complete selection
              </p>
            </div>
            <button
              onClick={exitDoubleClickMode}
              className="text-blue-600 hover:text-blue-800 px-3 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions for Double-Click Selection */}
      {showBulkActions && selectedDateList.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">
                Double-Click Mode: {selectedDateList.length} date{selectedDateList.length > 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-green-700">
                {selectedDateList.join(', ')}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Hover over dates to add them to selection
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkBlock}
                disabled={isBlocking}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isBlocking ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <X className="h-4 w-4" />
                )}
                Block All ({selectedDateList.length})
              </button>
              
              <button
                onClick={handleBulkUnblock}
                disabled={isBlocking}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isBlocking ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Unblock All ({selectedDateList.length})
              </button>
              
              <button
                onClick={exitDoubleClickMode}
                className="text-green-600 hover:text-green-800 px-3 py-2"
              >
                Exit Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Management Modal */}
      {showDateModal && clickedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Manage Date</h3>
              <button
                onClick={() => setShowDateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Selected Date:</p>
                <p className="text-lg font-medium text-gray-900">
                  {clickedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {isLoadingDateData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading date data...</span>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">Date Status:</p>
                    <div className="flex items-center space-x-2">
                      {calendarDateData?.status === 'unavailable' || isDateBlocked(clickedDate) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <X className="h-3 w-3 mr-1" />
                          Blocked
                        </span>
                      ) : isDateBooked(clickedDate) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          <Check className="h-3 w-3 mr-1" />
                          Booked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Available
                        </span>
                      )}
                    </div>
                  </div>


                </>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {!isDateBooked(clickedDate) && (
                  <>
                    {isDateBlocked(clickedDate) ? (
                      <button
                        onClick={handleUnblockSingleDate}
                        disabled={isBlocking}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isBlocking ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Unblock Date
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleBlockSingleDate}
                        disabled={isBlocking}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isBlocking ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Block Date
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
                
              </div>

              {isDateBooked(clickedDate) && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    This date is booked and cannot be blocked or unblocked.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
