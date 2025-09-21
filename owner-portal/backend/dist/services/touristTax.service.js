"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTouristTaxDetailedService = exports.getCityTaxService = void 0;
const hostkit_api_1 = require("../integrations/hostkit.api");
// Helper function to format amounts in Euros
// Using 'en-US' locale for consistent decimal separator (dot) across the application
const formatEuro = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};
// Property ID mapping - maps our property IDs to Hostkit's apid values
const PROPERTY_ID_MAPPING = {
    392776: "10026", // Update with actual Hostkit apid
    392777: "10027", // Update with actual Hostkit apid  
    392778: "10028" // Confirmed from debug data
};
const getCityTaxService = async (propertyId, startDate, endDate, filterType = 'checkin') => {
    try {
        // Use the working reservations API instead of problematic bookings API
        let bookings = [];
        try {
            // Try the working reservations API first (same as SIBA/invoices)
            const reservationsData = await (0, hostkit_api_1.getHostkitReservations)(propertyId, startDate, endDate);
            // With property-specific API keys, each key returns only that property's data
            bookings = Array.isArray(reservationsData) ? reservationsData : reservationsData.reservations || [];
        }
        catch (reservationError) {
            console.log('Reservations API failed, trying bookings API...', reservationError.message);
            // Fallback to bookings API
            bookings = await (0, hostkit_api_1.getChannelBookings)(propertyId, startDate, endDate);
        }
        // Filter bookings based on check-in or check-out dates (matching Hostkit's City Tax Report logic)
        const requestedStartDate = new Date(startDate);
        const requestedEndDate = new Date(endDate);
        const filteredBookings = bookings.filter((booking) => {
            // Extract check-in and check-out dates
            let checkInDate = null;
            let checkOutDate = null;
            if (booking.in_date) {
                checkInDate = new Date(booking.in_date * 1000);
            }
            else if (booking.arrivalDate) {
                checkInDate = new Date(booking.arrivalDate);
            }
            else if (booking.checkIn) {
                checkInDate = new Date(booking.checkIn);
            }
            if (booking.out_date) {
                checkOutDate = new Date(booking.out_date * 1000);
            }
            else if (booking.departureDate) {
                checkOutDate = new Date(booking.departureDate);
            }
            else if (booking.checkOut) {
                checkOutDate = new Date(booking.checkOut);
            }
            // If we can't determine dates, exclude the booking
            if (!checkInDate || !checkOutDate) {
                return false;
            }
            // Apply filtering based on the selected filter type
            if (filterType === 'checkin') {
                // Filter by check-in date
                return checkInDate >= requestedStartDate && checkInDate <= requestedEndDate;
            }
            else {
                // Filter by check-out date (default, matching Hostkit's City Tax Report logic)
                return checkOutDate >= requestedStartDate && checkOutDate <= requestedEndDate;
            }
        });
        console.log(`[CITY_TAX] Requested dates: ${startDate} to ${endDate}`);
        console.log(`[CITY_TAX] Total bookings from API: ${bookings.length}`);
        console.log(`[CITY_TAX] Filtered bookings for date range: ${filteredBookings.length}`);
        // Debug: Show which bookings were filtered out
        const debugStartDate = new Date(startDate);
        const debugEndDate = new Date(endDate);
        const excludedBookings = bookings.filter((booking) => {
            let checkInDate = null;
            let checkOutDate = null;
            if (booking.in_date) {
                checkInDate = new Date(booking.in_date * 1000);
            }
            else if (booking.arrivalDate) {
                checkInDate = new Date(booking.arrivalDate);
            }
            else if (booking.checkIn) {
                checkInDate = new Date(booking.checkIn);
            }
            if (booking.out_date) {
                checkOutDate = new Date(booking.out_date * 1000);
            }
            else if (booking.departureDate) {
                checkOutDate = new Date(booking.departureDate);
            }
            else if (booking.checkOut) {
                checkOutDate = new Date(booking.checkOut);
            }
            if (!checkInDate || !checkOutDate)
                return true;
            const overlaps = checkInDate < debugEndDate && checkOutDate > debugStartDate;
            return !overlaps;
        });
        console.log(`[CITY_TAX] Excluded bookings (outside date range): ${excludedBookings.length}`);
        excludedBookings.slice(0, 5).forEach((booking) => {
            const checkIn = booking.in_date ? new Date(booking.in_date * 1000).toISOString().split('T')[0] : 'unknown';
            const checkOut = booking.out_date ? new Date(booking.out_date * 1000).toISOString().split('T')[0] : 'unknown';
            console.log(`[CITY_TAX]   - ${booking.rcode}: ${checkIn} to ${checkOut}`);
        });
        // Calculate comprehensive statistics matching Hostkit City Tax Report format
        const stats = {
            propertyId,
            startDate,
            endDate,
            // City Tax Report Data (matching Hostkit format)
            cityTaxCalculated: 0,
            cityTaxCalculatedFormatted: '€0.00',
            cityTaxNights: 0,
            childrenNights: 0,
            nightsBeyond: 0,
            totalNights: 0, // Booking nights
            hostkitTotalNights: 0, // City tax nights + children nights + nights beyond (matches Hostkit report)
            cityTaxInvoiced: 0,
            cityTaxInvoicedFormatted: '€0.00',
            cityTaxInvoicedNights: 0,
            // Legacy fields for compatibility
            totalTax: 0,
            totalTaxFormatted: '€0.00',
            totalBookings: filteredBookings.length,
            totalGuests: 0,
            adultNights: 0,
            exemptNights: 0,
            taxableNights: 0,
            averageTaxPerNight: 0,
            averageTaxPerNightFormatted: '€0.00',
            averageTaxPerGuest: 0,
            averageTaxPerGuestFormatted: '€0.00',
            bookingsPlatforms: {},
            taxStatus: 'not_implemented', // 'not_implemented', 'active', 'exempt'
            dataSource: 'bookings_analysis',
            futureReady: true,
            currency: 'EUR'
        };
        // Process each booking for detailed statistics
        filteredBookings.forEach((booking) => {
            // Guest calculations - handle different API field names from Hostkit
            // From Hostkit guest_data array, we need to extract adults vs children by age
            let adults = 0;
            let children = 0;
            if (booking.guest_data && Array.isArray(booking.guest_data)) {
                // Parse guest_data array to count adults vs children
                booking.guest_data.forEach((guest) => {
                    if (guest.birthday) {
                        const birthDate = new Date(guest.birthday);
                        const age = new Date().getFullYear() - birthDate.getFullYear();
                        if (age >= 18) {
                            adults++;
                        }
                        else {
                            children++;
                        }
                    }
                    else {
                        // If no birthday, assume adult
                        adults++;
                    }
                });
            }
            // Fallback to basic fields if guest_data not available
            if (adults === 0 && children === 0) {
                adults = Number(booking.adults || booking.pax || 1);
                children = Number(booking.children || 0);
            }
            // Debug logging for guest counting
            if (booking.guest_data && Array.isArray(booking.guest_data)) {
                console.log(`[CITY_TAX] Booking ${booking.rcode}: ${adults} adults, ${children} children (from guest_data)`);
            }
            else {
                console.log(`[CITY_TAX] Booking ${booking.rcode}: ${adults} adults, ${children} children (from pax fallback)`);
            }
            const totalGuestsThisBooking = adults + children;
            // Calculate nights from dates if not provided directly
            let nights = Number(booking.nights || 0);
            if (nights === 0 && booking.in_date && booking.out_date) {
                // Hostkit API returns Unix timestamps
                const checkIn = new Date(booking.in_date * 1000);
                const checkOut = new Date(booking.out_date * 1000);
                nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            }
            else if (nights === 0 && booking.arrivalDate && booking.departureDate) {
                // Hostaway API returns date strings
                const checkIn = new Date(booking.arrivalDate);
                const checkOut = new Date(booking.departureDate);
                nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            }
            stats.totalGuests += totalGuestsThisBooking;
            stats.totalNights += nights; // Booking nights
            stats.adultNights += adults * nights;
            stats.childrenNights += children * nights;
            // City Tax Report calculations (matching Hostkit format)
            const currentTax = Number(booking.touristTax || booking.cityTax || booking.city_tax || 0);
            stats.cityTaxCalculated += currentTax;
            stats.cityTaxInvoiced += currentTax; // Same as calculated for now
            // City tax nights = adult nights (typically only adults pay city tax)
            const cityTaxNights = adults * nights;
            stats.cityTaxNights += cityTaxNights;
            stats.cityTaxInvoicedNights += cityTaxNights;
            // Children nights (often exempt from city tax)
            stats.childrenNights += children * nights;
            // Nights beyond threshold (for long-stay exemptions - typically 30+ nights)
            const nightsBeyond = nights > 30 ? nights - 30 : 0;
            stats.nightsBeyond += nightsBeyond;
            // Hostkit-style total nights = city tax nights + children nights + nights beyond
            // This matches the Hostkit report format
            const hostkitTotalNights = cityTaxNights + (children * nights) + nightsBeyond;
            stats.hostkitTotalNights += hostkitTotalNights;
            // Legacy tax calculations
            stats.totalTax += currentTax;
            // Platform tracking
            const platform = booking.provider || booking.channel || 'unknown';
            stats.bookingsPlatforms[platform] = (stats.bookingsPlatforms[platform] || 0) + 1;
            // Future tax calculation readiness
            if (currentTax > 0) {
                stats.taxStatus = 'active';
                stats.taxableNights += nights;
            }
            else {
                // Assume all nights will be taxable when implemented (except children under certain age)
                stats.taxableNights += adults * nights; // Only adults typically pay tourist tax
                stats.exemptNights += children * nights; // Children often exempt
            }
        });
        // Calculate averages (future-ready)
        if (stats.totalNights > 0) {
            stats.averageTaxPerNight = stats.totalTax / stats.totalNights;
            stats.averageTaxPerNightFormatted = formatEuro(stats.averageTaxPerNight);
        }
        if (stats.totalGuests > 0) {
            stats.averageTaxPerGuest = stats.totalTax / stats.totalGuests;
            stats.averageTaxPerGuestFormatted = formatEuro(stats.averageTaxPerGuest);
        }
        // Format city tax amounts (matching Hostkit format)
        stats.cityTaxCalculatedFormatted = formatEuro(stats.cityTaxCalculated);
        stats.cityTaxInvoicedFormatted = formatEuro(stats.cityTaxInvoiced);
        // Format total tax (legacy)
        stats.totalTaxFormatted = formatEuro(stats.totalTax);
        // Try to get tourist tax from dedicated API (if available)
        try {
            const apiTax = await (0, hostkit_api_1.getHostkitTouristTax)(propertyId, startDate, endDate);
            if (apiTax > 0) {
                stats.totalTax = apiTax;
                stats.totalTaxFormatted = formatEuro(apiTax);
                stats.taxStatus = 'active';
                stats.dataSource = 'hostkit_api';
                // Recalculate averages with API data
                if (stats.totalNights > 0) {
                    stats.averageTaxPerNight = stats.totalTax / stats.totalNights;
                    stats.averageTaxPerNightFormatted = formatEuro(stats.averageTaxPerNight);
                }
                if (stats.totalGuests > 0) {
                    stats.averageTaxPerGuest = stats.totalTax / stats.totalGuests;
                    stats.averageTaxPerGuestFormatted = formatEuro(stats.averageTaxPerGuest);
                }
            }
        }
        catch (apiError) {
            // API not available, use calculated stats
        }
        return stats;
    }
    catch (error) {
        console.error("Error fetching tourist tax service:", error);
        return {
            propertyId,
            startDate,
            endDate,
            totalTax: 0,
            totalBookings: 0,
            totalGuests: 0,
            totalNights: 0,
            taxStatus: 'error',
            dataSource: 'error',
            error: error.message
        };
    }
};
exports.getCityTaxService = getCityTaxService;
const getTouristTaxDetailedService = async (propertyId, startDate, endDate, filterType = 'checkout') => {
    try {
        // Use the working reservations API instead of problematic bookings API
        let bookings = [];
        try {
            // Try the working reservations API first (same as SIBA/invoices)
            const reservationsData = await (0, hostkit_api_1.getHostkitReservations)(propertyId, startDate, endDate);
            // With property-specific API keys, each key returns only that property's data
            bookings = Array.isArray(reservationsData) ? reservationsData : reservationsData.reservations || [];
        }
        catch (reservationError) {
            console.log('Reservations API failed, trying bookings API...', reservationError.message);
            // Fallback to bookings API
            bookings = await (0, hostkit_api_1.getChannelBookings)(propertyId, startDate, endDate);
        }
        // Filter bookings based on check-in or check-out dates (matching Hostkit's City Tax Report logic)
        const requestedStartDate = new Date(startDate);
        const requestedEndDate = new Date(endDate);
        const filteredBookings = bookings.filter((booking) => {
            // Extract check-in and check-out dates
            let checkInDate = null;
            let checkOutDate = null;
            if (booking.in_date) {
                checkInDate = new Date(booking.in_date * 1000);
            }
            else if (booking.arrivalDate) {
                checkInDate = new Date(booking.arrivalDate);
            }
            else if (booking.checkIn) {
                checkInDate = new Date(booking.checkIn);
            }
            if (booking.out_date) {
                checkOutDate = new Date(booking.out_date * 1000);
            }
            else if (booking.departureDate) {
                checkOutDate = new Date(booking.departureDate);
            }
            else if (booking.checkOut) {
                checkOutDate = new Date(booking.checkOut);
            }
            // If we can't determine dates, exclude the booking
            if (!checkInDate || !checkOutDate) {
                return false;
            }
            // Apply filtering based on the selected filter type
            if (filterType === 'checkin') {
                // Filter by check-in date
                return checkInDate >= requestedStartDate && checkInDate <= requestedEndDate;
            }
            else {
                // Filter by check-out date (default, matching Hostkit's City Tax Report logic)
                return checkOutDate >= requestedStartDate && checkOutDate <= requestedEndDate;
            }
        });
        console.log(`[TOURIST_TAX_DETAILED] Requested dates: ${startDate} to ${endDate}`);
        console.log(`[TOURIST_TAX_DETAILED] Total bookings from API: ${bookings.length}`);
        console.log(`[TOURIST_TAX_DETAILED] Filtered bookings for date range: ${filteredBookings.length}`);
        // Enhanced detailed breakdown with future-ready calculations
        const taxDetails = filteredBookings.map((booking) => {
            // Guest calculations - handle different API field names from Hostkit
            let adults = 0;
            let children = 0;
            if (booking.guest_data && Array.isArray(booking.guest_data)) {
                // Parse guest_data array to count adults vs children by age
                booking.guest_data.forEach((guest) => {
                    if (guest.birthday) {
                        const birthDate = new Date(guest.birthday);
                        const age = new Date().getFullYear() - birthDate.getFullYear();
                        if (age >= 18) {
                            adults++;
                        }
                        else {
                            children++;
                        }
                    }
                    else {
                        // If no birthday, assume adult
                        adults++;
                    }
                });
            }
            // Fallback to basic fields if guest_data not available
            if (adults === 0 && children === 0) {
                adults = Number(booking.adults || booking.pax || 1);
                children = Number(booking.children || 0);
            }
            // Calculate nights from dates if not provided directly
            let nights = Number(booking.nights || 0);
            if (nights === 0 && booking.in_date && booking.out_date) {
                // Hostkit API returns Unix timestamps
                const checkIn = new Date(booking.in_date * 1000);
                const checkOut = new Date(booking.out_date * 1000);
                nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            }
            else if (nights === 0 && booking.arrivalDate && booking.departureDate) {
                // Hostaway API returns date strings
                const checkIn = new Date(booking.arrivalDate);
                const checkOut = new Date(booking.departureDate);
                nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            }
            const currentTax = Number(booking.touristTax || booking.cityTax || booking.city_tax || 0);
            // Future tax calculation (when implemented)
            const estimatedTaxableNights = adults * nights; // Typically only adults pay
            const estimatedTaxPerAdultNight = 2.0; // Common rate in Portugal (€2/adult/night)
            const estimatedTotalTax = currentTax > 0 ? currentTax : estimatedTaxableNights * estimatedTaxPerAdultNight;
            return {
                reservationId: booking.rcode || booking.id,
                bookingId: booking.id,
                guestName: booking.firstname && booking.lastname ?
                    `${booking.firstname} ${booking.lastname}` :
                    (booking.guestName || 'Guest'),
                checkIn: booking.in_date ? new Date(booking.in_date * 1000).toISOString().split('T')[0] : booking.checkIn,
                checkOut: booking.out_date ? new Date(booking.out_date * 1000).toISOString().split('T')[0] : booking.checkOut,
                platform: booking.provider || booking.channel || 'unknown',
                nights: nights,
                adults: adults,
                children: children,
                totalGuests: adults + children,
                // Current tax (actual)
                currentTax: currentTax,
                currentTaxFormatted: formatEuro(currentTax),
                currentTaxPerNight: nights > 0 ? currentTax / nights : 0,
                currentTaxPerNightFormatted: nights > 0 ? formatEuro(currentTax / nights) : '€0.00',
                // Future-ready calculations
                taxableNights: estimatedTaxableNights,
                exemptNights: children * nights,
                estimatedTaxPerNight: estimatedTaxPerAdultNight,
                estimatedTaxPerNightFormatted: formatEuro(estimatedTaxPerAdultNight),
                estimatedTotalTax: estimatedTotalTax,
                estimatedTotalTaxFormatted: formatEuro(estimatedTotalTax),
                // Status indicators
                taxImplemented: currentTax > 0,
                status: booking.status || 'confirmed',
                // Additional useful data
                totalRevenue: Number(booking.received_amount || booking.totalPrice || 0),
                cleaningFee: Number(booking.cleaning_fee || booking.cleaningFee || 0)
            };
        });
        // Calculate totals
        const totalCurrentTax = taxDetails.reduce((sum, detail) => sum + detail.currentTax, 0);
        const totalEstimatedTax = taxDetails.reduce((sum, detail) => sum + detail.estimatedTotalTax, 0);
        const totalNights = taxDetails.reduce((sum, detail) => sum + detail.nights, 0);
        const totalGuests = taxDetails.reduce((sum, detail) => sum + detail.totalGuests, 0);
        const totalAdultNights = taxDetails.reduce((sum, detail) => sum + detail.taxableNights, 0);
        const totalChildrenNights = taxDetails.reduce((sum, detail) => sum + detail.exemptNights, 0);
        // Platform breakdown
        const platformBreakdown = taxDetails.reduce((acc, detail) => {
            const platform = detail.platform;
            if (!acc[platform]) {
                acc[platform] = { bookings: 0, nights: 0, guests: 0, currentTax: 0, estimatedTax: 0 };
            }
            acc[platform].bookings += 1;
            acc[platform].nights += detail.nights;
            acc[platform].guests += detail.totalGuests;
            acc[platform].currentTax += detail.currentTax;
            acc[platform].estimatedTax += detail.estimatedTotalTax;
            return acc;
        }, {});
        return {
            propertyId,
            startDate,
            endDate,
            // Summary statistics
            summary: {
                totalBookings: taxDetails.length,
                totalNights,
                totalGuests,
                totalAdultNights,
                totalChildrenNights,
                // Current tax (what's actually charged now)
                currentTax: {
                    total: totalCurrentTax,
                    totalFormatted: formatEuro(totalCurrentTax),
                    perNight: totalNights > 0 ? totalCurrentTax / totalNights : 0,
                    perNightFormatted: totalNights > 0 ? formatEuro(totalCurrentTax / totalNights) : '€0.00',
                    perGuest: totalGuests > 0 ? totalCurrentTax / totalGuests : 0,
                    perGuestFormatted: totalGuests > 0 ? formatEuro(totalCurrentTax / totalGuests) : '€0.00',
                    implemented: totalCurrentTax > 0
                },
                // Future-ready estimations
                estimatedTax: {
                    total: totalEstimatedTax,
                    totalFormatted: formatEuro(totalEstimatedTax),
                    perAdultNight: 2.0,
                    perAdultNightFormatted: formatEuro(2.0),
                    perNight: totalNights > 0 ? totalEstimatedTax / totalNights : 0,
                    perNightFormatted: totalNights > 0 ? formatEuro(totalEstimatedTax / totalNights) : '€0.00',
                    potential: totalAdultNights * 2.0, // Potential revenue when implemented
                    potentialFormatted: formatEuro(totalAdultNights * 2.0)
                }
            },
            // Platform breakdown
            platformBreakdown,
            // Individual booking details
            bookings: taxDetails,
            // Meta information
            taxStatus: totalCurrentTax > 0 ? 'active' : 'not_implemented',
            dataSource: 'bookings_analysis',
            futureReady: true,
            lastUpdated: new Date().toISOString()
        };
    }
    catch (error) {
        console.error("Error fetching detailed tourist tax:", error);
        throw error;
    }
};
exports.getTouristTaxDetailedService = getTouristTaxDetailedService;
