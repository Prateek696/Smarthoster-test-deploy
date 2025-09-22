"use strict";
// Utility to manually filter booking data when APIs don't filter properly
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterBookings = exports.filterBookingsByDateRange = exports.filterBookingsByProperty = void 0;
const filterBookingsByProperty = (bookings, propertyId) => {
    // With property-specific API keys, filtering by property is no longer needed
    // Each API key returns only its own property's data
    return bookings;
};
exports.filterBookingsByProperty = filterBookingsByProperty;
const filterBookingsByDateRange = (bookings, startDate, endDate) => {
    const startTimestamp = new Date(startDate).getTime() / 1000;
    const endTimestamp = new Date(endDate).getTime() / 1000;
    return bookings.filter((booking) => {
        // Check if booking dates overlap with requested range
        if (booking.in_date && booking.out_date) {
            // Hostkit uses Unix timestamps
            const bookingStart = Number(booking.in_date);
            const bookingEnd = Number(booking.out_date);
            return (bookingStart >= startTimestamp && bookingStart <= endTimestamp) ||
                (bookingEnd >= startTimestamp && bookingEnd <= endTimestamp) ||
                (bookingStart <= startTimestamp && bookingEnd >= endTimestamp);
        }
        else if (booking.arrivalDate && booking.departureDate) {
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
exports.filterBookingsByDateRange = filterBookingsByDateRange;
const filterBookings = (bookings, propertyId, startDate, endDate) => {
    return (0, exports.filterBookingsByDateRange)((0, exports.filterBookingsByProperty)(bookings, propertyId), startDate, endDate);
};
exports.filterBookings = filterBookings;
