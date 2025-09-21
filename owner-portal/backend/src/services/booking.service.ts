import {
  getHostawayCalendar,
  updateHostawayCalendar,
  getHostawayReservations,
} from "../integrations/hostaway.api";

import {
  updateHostkitCalendar,
} from "../integrations/hostkit.api";

import { mapBookingStatus, mapPaymentStatus } from "../utils/statusMapper";

/**
 * Get calendar availability and bookings from Hostaway
 */
export const getCalendarService = async (
  listingId: number,
  startDate: string,
  endDate: string
) => {
  try {
    // Get calendar data from Hostaway
    const calendarData = await getHostawayCalendar(listingId, startDate, endDate);
    
    // Get bookings for the same period
    const bookingsData = await getBookingsService(listingId, startDate, endDate);
    
    // Process real Hostaway calendar data
    let realBlockedDates: any[] = [];
    if (calendarData.result && Array.isArray(calendarData.result)) {
      realBlockedDates = calendarData.result
        .filter((item: any) => item.status === 'unavailable' || item.status === 'blocked')
        .map((item: any) => ({
          date: item.date || item.startDate,
          endDate: item.endDate,
          status: item.status,
          reason: item.reason || 'Blocked by owner'
        }));
    }
    
    // Return a consistent structure
    return {
      status: 'success',
      result: calendarData.result || [],
      bookings: bookingsData.bookings || [],
      blockedDates: realBlockedDates,
      availableDates: calendarData.availableDates || []
    };
  } catch (error) {
    console.error("Error in getCalendarService:", error);
    // Return empty structure on error
    return {
      status: 'error',
      result: [],
      bookings: [],
      blockedDates: [],
      availableDates: []
    };
  }
};



/**
 * Update calendar status on Hostaway and optionally mirror to Hostkit
 */
export const updateCalendarService = async (
  listingId: number,
  startDate: string,
  endDate: string,
  status: "blocked" | "available"
) => {
  try {
    // Update Hostaway calendar (real API)
    const hostawayRes = await updateHostawayCalendar(
      listingId,
      startDate,
      endDate,
      status
    );
    console.log('Hostaway calendar updated successfully:', hostawayRes);

    // Mirror update in Hostkit (if API key present)
    let hostkitRes = null;
    try {
      hostkitRes = await updateHostkitCalendar(
        listingId,
        startDate,
        endDate,
        status
      );
    } catch (hostkitError) {
      console.warn('Hostkit calendar update failed:', hostkitError);
      // Don't fail the entire operation if Hostkit fails
    }

    return { 
      success: true,
      hostawayRes, 
      hostkitRes,
      message: `Calendar updated successfully on Hostaway for ${startDate} to ${endDate}`,
      source: 'hostaway'
    };
    
  } catch (error: any) {
    console.error('Calendar update service failed:', {
      error: error.message,
      listingId,
      startDate,
      endDate,
      status
    });
    throw new Error(`Failed to update calendar: ${error.message}`);
  }
};

/**
 * Get bookings/reservations from Hostaway with enhanced formatting for booking table
 */
export const getBookingsService = async (
  listingId: number,
  startDate: string,
  endDate: string
) => {
  try {
    // Fetch all reservations first (Hostaway API may not support date filtering)
    const reservationsData = await getHostawayReservations(listingId, startDate, endDate);
    let reservations = Array.isArray(reservationsData.result) ? reservationsData.result : [];

    // Apply simple client-side date filtering
    // Simple date filtering - only filter if specific dates are provided
    if (startDate && endDate && startDate !== '2020-01-01' && endDate !== '2030-12-31') {
      const filterStart = new Date(startDate);
      const filterEnd = new Date(endDate);
      
      reservations = reservations.filter((booking: any) => {
        // Get booking dates
        const bookingArrival = new Date(booking.arrivalDate);
        const bookingDeparture = new Date(booking.departureDate);
        
        // Include booking if it overlaps with the requested period
        // Booking is included if arrival OR departure falls within the range
        const arrivalInRange = bookingArrival >= filterStart && bookingArrival <= filterEnd;
        const departureInRange = bookingDeparture >= filterStart && bookingDeparture <= filterEnd;
        
        return arrivalInRange || departureInRange;
      });
    }

    // Format bookings for table display with all required fields
    const formattedBookings = reservations.map((booking: any) => {
      // Handle guest email - often not provided by Hostaway API for privacy reasons
      let guestEmail = booking.guestEmail;
      if (!guestEmail || guestEmail === null || guestEmail === '') {
        // Check alternate email fields
        guestEmail = booking.email || booking.contactEmail || booking.guestContactEmail || null;
      }

      // Improve payment status mapping
      let paymentStatus = booking.paymentStatus;
      if (!paymentStatus || paymentStatus === null || paymentStatus === '') {
        // Map from other fields
        if (booking.isPaid === 1 || booking.isPaid === true) {
          paymentStatus = 'Paid';
        } else if (booking.status === 'cancelled') {
          paymentStatus = null; // Cancelled bookings don't have payment status
        } else if (booking.status === 'inquiry' || booking.status === 'inquiryPreapproved') {
          paymentStatus = 'Pending'; // Changed from 'Unknown' to 'Pending' for inquiries
        } else if (booking.remainingBalance === 0) {
          paymentStatus = 'Paid';
        } else if (booking.remainingBalance > 0) {
          paymentStatus = 'Partial';
        } else {
          paymentStatus = 'Unknown';
        }
      }

      // Format check-in/out times properly
      const formatTime = (time: number) => {
        if (!time) return null;
        return `${time}:00`; // Convert 15 to "15:00", 11 to "11:00"
      };

      // Provide user-friendly email display
      const emailDisplay = guestEmail || "Not provided by platform (privacy policy)";

      return {
        id: booking.id,
        listingId: booking.listingId,
        guestName: booking.guestName || `${booking.guestFirstName || ''} ${booking.guestLastName || ''}`.trim(),
        guestEmail: emailDisplay,
        guestPhone: booking.guestPhone || booking.phone,
        provider: booking.channelName || booking.source || 'Direct',
        arrivalDate: booking.arrivalDate,
        departureDate: booking.departureDate,
        nights: booking.nights || calculateNights(booking.arrivalDate, booking.departureDate),
        adults: booking.adults || 1,
        children: booking.children || 0,
        totalPrice: booking.totalPrice || 0,
        commission: 0, // Commission removed - totalPrice is final amount
        cleaningFee: booking.cleaningFee || 0, // For reference only - already included in totalPrice
        cityTax: booking.cityTax || booking.touristTax || 0,
        securityDeposit: booking.securityDeposit || 0,
        status: mapBookingStatus(booking.status),
        paymentStatus: mapPaymentStatus(paymentStatus, booking.status),
        checkInTime: formatTime(booking.checkInTime), // Format as "15:00"
        checkOutTime: formatTime(booking.checkOutTime), // Format as "11:00"
        specialRequests: booking.specialRequests || booking.guestNotes,
        createdAt: booking.createdAt || booking.insertedOn,
        updatedAt: booking.updatedAt || booking.lastModified,
        // Reservation IDs
        hostawayReservationId: booking.hostawayReservationId || booking.id,
        channelReservationId: booking.channelReservationId || booking.reservationId,
        confirmationCode: booking.confirmationCode,
        // Financial breakdown - totalPrice is the final amount (no deductions needed)
        netAmount: booking.totalPrice || 0,
        currency: booking.currency || 'EUR'
      };
    });

    // Sort by arrival date (newest first)
    formattedBookings.sort((a: any, b: any) => 
      new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime()
    );

    // Add data quality analysis
    const currentDate = new Date();
    const futureBookings = formattedBookings.filter((b: any) => 
      new Date(b.arrivalDate) > new Date(currentDate.getFullYear() + 1, 11, 31)
    );
    const bookingsWithoutEmail = formattedBookings.filter((b: any) => 
      !b.guestEmail || b.guestEmail === "Not provided by platform (privacy policy)"
    );
    const unknownPaymentStatus = formattedBookings.filter((b: any) => b.paymentStatus === 'Unknown');

    return {
      bookings: formattedBookings,
      total: formattedBookings.length,
      summary: {
        totalRevenue: formattedBookings.reduce((sum: number, b: any) => sum + b.totalPrice, 0),
        totalCommission: 0, // Commission removed
        totalCleaningFees: formattedBookings.reduce((sum: number, b: any) => sum + b.cleaningFee, 0),
        totalCityTax: formattedBookings.reduce((sum: number, b: any) => sum + b.cityTax, 0),
        totalNights: formattedBookings.reduce((sum: number, b: any) => sum + b.nights, 0),
        averageNightlyRate: formattedBookings.length > 0 
          ? formattedBookings.reduce((sum: number, b: any) => sum + (b.totalPrice / b.nights), 0) / formattedBookings.length 
          : 0
      },
      dataQuality: {
        totalBookings: formattedBookings.length,
        futureBookingsCount: futureBookings.length,
        missingEmailCount: bookingsWithoutEmail.length,
        unknownPaymentCount: unknownPaymentStatus.length,
        emailAvailabilityRate: ((formattedBookings.length - bookingsWithoutEmail.length) / formattedBookings.length * 100).toFixed(1) + '%',
        notes: {
          missingEmails: "Guest emails are often not provided by booking platforms (Airbnb, Booking.com) for privacy reasons",
          futureBookings: futureBookings.length > 0 ? `${futureBookings.length} bookings extend into ${currentDate.getFullYear() + 2} or beyond` : "No unusual future booking dates detected",
          paymentStatus: unknownPaymentStatus.length > 0 ? `${unknownPaymentStatus.length} bookings have unclear payment status` : "All payment statuses are clear"
        }
      }
    };
  } catch (error) {
    console.error("Error in getBookingsService:", error);
    throw new Error("Failed to fetch bookings data");
  }
};

// Helper functions
function calculateNights(arrivalDate: string, departureDate: string): number {
  if (!arrivalDate || !departureDate) return 0;
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);
  const diffTime = Math.abs(departure.getTime() - arrival.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function calculateCommission(totalPrice: number, commissionPercent: number): number {
  return Math.round((totalPrice * (commissionPercent / 100)) * 100) / 100;
}

/**
 * Get individual booking details with enhanced information
 */
export const getBookingDetailService = async (
  listingId: number,
  bookingId: string
) => {
  try {
    // Get all bookings for the property
    const bookingsData = await getBookingsService(listingId, '2020-01-01', '2030-12-31');
    
    // Find the specific booking
    const booking = bookingsData.bookings.find((b: any) => 
      b.id === bookingId || 
      b.reservationId === bookingId ||
      b.id?.toString() === bookingId
    );
    
    if (!booking) {
      return null;
    }
    
    // Enhance booking with additional details
    const propertyName = await getPropertyName(listingId);
    const enhancedBooking = {
      ...booking,
      // Add property information
      propertyId: listingId,
      propertyName: propertyName,
      // Add download links
      downloadLinks: {
        pdf: `/api/bookings/${bookingId}/download/pdf?propertyId=${listingId}`,
        csv: `/api/bookings/${bookingId}/download/csv?propertyId=${listingId}`,
        invoice: booking.invoiceId ? `/api/invoices/${booking.invoiceId}/download` : null
      },
      // Add additional calculated fields
      totalNights: booking.nights || calculateNights(booking.arrivalDate, booking.departureDate),
      totalGuests: (booking.adults || 0) + (booking.children || 0),
      netAmount: booking.totalPrice || 0, // No deductions - totalPrice is final amount
      // Add status information
      statusInfo: {
        isUpcoming: isDateInFuture(booking.arrivalDate),
        isCurrent: isDateInRange(booking.arrivalDate, booking.departureDate),
        isCompleted: isDateInPast(booking.departureDate)
      }
    };
    
    return enhancedBooking;
  } catch (error: any) {
    console.error('Error fetching booking detail:', error);
    throw new Error(`Failed to fetch booking detail: ${error.message}`);
  }
};

// Helper functions for booking details
const getPropertyName = async (propertyId: number): Promise<string> => {
  try {
    const PropertyModel = require('../models/property.model').default;
    const property = await PropertyModel.findOne({ id: propertyId });
    return property ? property.name : `Property ${propertyId}`;
  } catch (error) {
    console.error(`Error fetching property name for ${propertyId}:`, error);
    return `Property ${propertyId}`;
  }
};

const isDateInFuture = (dateString: string): boolean => {
  return new Date(dateString) > new Date();
};

const isDateInPast = (dateString: string): boolean => {
  return new Date(dateString) < new Date();
};

const isDateInRange = (startDate: string, endDate: string): boolean => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  return now >= start && now <= end;
};


