"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingDetailService = exports.getBookingsService = exports.updateCalendarService = exports.getCalendarService = void 0;
const hostaway_api_1 = require("../integrations/hostaway.api");
const hostkit_api_1 = require("../integrations/hostkit.api");
const statusMapper_1 = require("../utils/statusMapper");
/**
 * Get calendar availability and bookings from Hostaway
 */
const getCalendarService = async (listingId, startDate, endDate) => {
    try {
        // Get calendar data from Hostaway
        const calendarData = await (0, hostaway_api_1.getHostawayCalendar)(listingId, startDate, endDate);
        // Get bookings for the same period
        const bookingsData = await (0, exports.getBookingsService)(listingId, startDate, endDate);
        // Process real Hostaway calendar data
        let realBlockedDates = [];
        if (calendarData.result && Array.isArray(calendarData.result)) {
            realBlockedDates = calendarData.result
                .filter((item) => item.status === 'unavailable' || item.status === 'blocked')
                .map((item) => ({
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
    }
    catch (error) {
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
exports.getCalendarService = getCalendarService;
/**
 * Update calendar status on Hostaway and optionally mirror to Hostkit
 */
const updateCalendarService = async (listingId, startDate, endDate, status) => {
    try {
        // Update Hostaway calendar (real API)
        const hostawayRes = await (0, hostaway_api_1.updateHostawayCalendar)(listingId, startDate, endDate, status);
        console.log('Hostaway calendar updated successfully:', hostawayRes);
        // Mirror update in Hostkit (if API key present)
        let hostkitRes = null;
        try {
            hostkitRes = await (0, hostkit_api_1.updateHostkitCalendar)(listingId, startDate, endDate, status);
        }
        catch (hostkitError) {
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
    }
    catch (error) {
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
exports.updateCalendarService = updateCalendarService;
/**
 * Get bookings/reservations from Hostaway with enhanced formatting for booking table
 */
const getBookingsService = async (listingId, startDate, endDate) => {
    try {
        // Fetch all reservations first (Hostaway API may not support date filtering)
        const reservationsData = await (0, hostaway_api_1.getHostawayReservations)(listingId, startDate, endDate);
        let reservations = Array.isArray(reservationsData.result) ? reservationsData.result : [];
        // Apply simple client-side date filtering
        // Simple date filtering - only filter if specific dates are provided
        if (startDate && endDate && startDate !== '2020-01-01' && endDate !== '2030-12-31') {
            const filterStart = new Date(startDate);
            const filterEnd = new Date(endDate);
            reservations = reservations.filter((booking) => {
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
        const formattedBookings = reservations.map((booking) => {
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
                }
                else if (booking.status === 'cancelled') {
                    paymentStatus = null; // Cancelled bookings don't have payment status
                }
                else if (booking.status === 'inquiry' || booking.status === 'inquiryPreapproved') {
                    paymentStatus = 'Pending'; // Changed from 'Unknown' to 'Pending' for inquiries
                }
                else if (booking.remainingBalance === 0) {
                    paymentStatus = 'Paid';
                }
                else if (booking.remainingBalance > 0) {
                    paymentStatus = 'Partial';
                }
                else {
                    paymentStatus = 'Unknown';
                }
            }
            // Format check-in/out times properly
            const formatTime = (time) => {
                if (!time)
                    return null;
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
                status: (0, statusMapper_1.mapBookingStatus)(booking.status),
                paymentStatus: (0, statusMapper_1.mapPaymentStatus)(paymentStatus, booking.status),
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
        formattedBookings.sort((a, b) => new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime());
        // Add data quality analysis
        const currentDate = new Date();
        const futureBookings = formattedBookings.filter((b) => new Date(b.arrivalDate) > new Date(currentDate.getFullYear() + 1, 11, 31));
        const bookingsWithoutEmail = formattedBookings.filter((b) => !b.guestEmail || b.guestEmail === "Not provided by platform (privacy policy)");
        const unknownPaymentStatus = formattedBookings.filter((b) => b.paymentStatus === 'Unknown');
        return {
            bookings: formattedBookings,
            total: formattedBookings.length,
            summary: {
                totalRevenue: formattedBookings.reduce((sum, b) => sum + b.totalPrice, 0),
                totalCommission: 0, // Commission removed
                totalCleaningFees: formattedBookings.reduce((sum, b) => sum + b.cleaningFee, 0),
                totalCityTax: formattedBookings.reduce((sum, b) => sum + b.cityTax, 0),
                totalNights: formattedBookings.reduce((sum, b) => sum + b.nights, 0),
                averageNightlyRate: formattedBookings.length > 0
                    ? formattedBookings.reduce((sum, b) => sum + (b.totalPrice / b.nights), 0) / formattedBookings.length
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
    }
    catch (error) {
        console.error("Error in getBookingsService:", error);
        throw new Error("Failed to fetch bookings data");
    }
};
exports.getBookingsService = getBookingsService;
// Helper functions
function calculateNights(arrivalDate, departureDate) {
    if (!arrivalDate || !departureDate)
        return 0;
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);
    const diffTime = Math.abs(departure.getTime() - arrival.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
function calculateCommission(totalPrice, commissionPercent) {
    return Math.round((totalPrice * (commissionPercent / 100)) * 100) / 100;
}
/**
 * Get individual booking details with enhanced information
 */
const getBookingDetailService = async (listingId, bookingId) => {
    try {
        // Get all bookings for the property
        const bookingsData = await (0, exports.getBookingsService)(listingId, '2020-01-01', '2030-12-31');
        // Find the specific booking
        const booking = bookingsData.bookings.find((b) => b.id === bookingId ||
            b.reservationId === bookingId ||
            b.id?.toString() === bookingId);
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
    }
    catch (error) {
        console.error('Error fetching booking detail:', error);
        throw new Error(`Failed to fetch booking detail: ${error.message}`);
    }
};
exports.getBookingDetailService = getBookingDetailService;
// Helper functions for booking details
const getPropertyName = async (propertyId) => {
    try {
        const PropertyModel = require('../models/property.model').default;
        const property = await PropertyModel.findOne({ id: propertyId });
        return property ? property.name : `Property ${propertyId}`;
    }
    catch (error) {
        console.error(`Error fetching property name for ${propertyId}:`, error);
        return `Property ${propertyId}`;
    }
};
const isDateInFuture = (dateString) => {
    return new Date(dateString) > new Date();
};
const isDateInPast = (dateString) => {
    return new Date(dateString) < new Date();
};
const isDateInRange = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
};
