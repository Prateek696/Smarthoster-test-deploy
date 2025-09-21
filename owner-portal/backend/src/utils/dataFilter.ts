// Utility to manually filter booking data when APIs don't filter properly

export const filterBookingsByProperty = (bookings: any[], propertyId: number): any[] => {
  // With property-specific API keys, filtering by property is no longer needed
  // Each API key returns only its own property's data
  return bookings;
};

export const filterBookingsByDateRange = (bookings: any[], startDate: string, endDate: string): any[] => {
  const startTimestamp = new Date(startDate).getTime() / 1000;
  const endTimestamp = new Date(endDate).getTime() / 1000;
  
  return bookings.filter((booking: any) => {
    // Check if booking dates overlap with requested range
    if (booking.in_date && booking.out_date) {
      // Hostkit uses Unix timestamps
      const bookingStart = Number(booking.in_date);
      const bookingEnd = Number(booking.out_date);
      
      return (bookingStart >= startTimestamp && bookingStart <= endTimestamp) ||
             (bookingEnd >= startTimestamp && bookingEnd <= endTimestamp) ||
             (bookingStart <= startTimestamp && bookingEnd >= endTimestamp);
    } else if (booking.arrivalDate && booking.departureDate) {
      // Hostaway uses date strings
      const bookingStart = new Date(booking.arrivalDate).getTime() / 1000;
      const bookingEnd = new Date(booking.departureDate).getTime() / 1000;
      
      return (bookingStart >= startTimestamp && bookingStart <= endTimestamp) ||
             (bookingEnd >= startTimestamp && bookingEnd <= endTimestamp) ||
             (bookingStart <= startTimestamp && bookingEnd >= endTimestamp);
    }
    
    return true; // If no date info, include it
  });
};

export const filterBookings = (bookings: any[], propertyId: number, startDate: string, endDate: string): any[] => {
  return filterBookingsByDateRange(
    filterBookingsByProperty(bookings, propertyId),
    startDate,
    endDate
  );
};
