"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyPerformanceService = void 0;
const hostaway_api_1 = require("../integrations/hostaway.api");
const hostkit_api_1 = require("../integrations/hostkit.api");
const getMonthlyPerformanceService = async (listingId, month) => {
    try {
        // Construct start and end dates for the requested month
        const dateStart = `${month}-01`;
        const dateEnd = new Date(new Date(dateStart).getFullYear(), new Date(dateStart).getMonth() + 1, 0, 23, 59, 59).toISOString().substring(0, 10);
        // Fetch data from both Hostaway and Hostkit
        const [hostawayReservations, hostkitReservations, invoicesResult] = await Promise.all([
            (0, hostaway_api_1.getHostawayReservations)(listingId, dateStart, dateEnd).catch(() => ({ result: [] })),
            (0, hostkit_api_1.getHostkitReservations)(listingId, dateStart, dateEnd).catch(() => []),
            (0, hostkit_api_1.getHostkitInvoices)(listingId, dateStart, dateEnd).catch(() => [])
        ]);
        // Extract reservations arrays safely
        const hostawayRes = Array.isArray(hostawayReservations.result)
            ? hostawayReservations.result
            : [];
        const hostkitRes = Array.isArray(hostkitReservations)
            ? hostkitReservations
            : [];
        const fromDate = new Date(dateStart);
        const toDate = new Date(dateEnd);
        // Process Hostaway reservations
        const hostawayFiltered = hostawayRes.filter(r => {
            if (!r.arrivalDate || !r.departureDate)
                return false;
            const arrival = new Date(r.arrivalDate);
            const departure = new Date(r.departureDate);
            const isValidStatus = r.status === "modified" && r.paymentStatus === "Paid";
            const overlapsMonth = (arrival >= fromDate && arrival <= toDate) ||
                (departure >= fromDate && departure <= toDate) ||
                (arrival <= fromDate && departure >= toDate);
            return isValidStatus && overlapsMonth;
        });
        // Process Hostkit reservations (alternative data source)
        const hostkitFiltered = hostkitRes.filter((r) => {
            if (!r.checkIn || !r.checkOut)
                return false;
            const checkIn = new Date(r.checkIn);
            const checkOut = new Date(r.checkOut);
            const overlapsMonth = (checkIn >= fromDate && checkIn <= toDate) ||
                (checkOut >= fromDate && checkOut <= toDate) ||
                (checkIn <= fromDate && checkOut >= toDate);
            return overlapsMonth;
        });
        // Use Hostaway data as primary, Hostkit as fallback
        const reservations = hostawayFiltered.length > 0 ? hostawayFiltered : hostkitFiltered;
        // Calculate metrics
        let grossRevenue = 0;
        let cleaningFees = 0;
        let bookingCount = reservations.length;
        if (hostawayFiltered.length > 0) {
            // Calculate from Hostaway data
            grossRevenue = hostawayFiltered.reduce((sum, r) => sum + (r.totalPrice ?? 0), 0);
            cleaningFees = hostawayFiltered.reduce((sum, r) => sum + (r.cleaningFee ?? 0), 0);
        }
        else {
            // Calculate from Hostkit data
            grossRevenue = hostkitFiltered.reduce((sum, r) => sum + (r.totalAmount ?? r.revenue ?? 0), 0);
            cleaningFees = hostkitFiltered.reduce((sum, r) => sum + (r.cleaningFee ?? r.fees ?? 0), 0);
        }
        // Calculate commissions and net payout
        const commissionPercent = 15; // This could be configurable per property
        const commissionTotal = grossRevenue * (commissionPercent / 100);
        const netPayout = grossRevenue - commissionTotal - cleaningFees;
        // Process invoices
        const invoices = Array.isArray(invoicesResult) ? invoicesResult : [];
        const invoiceTotal = invoices.reduce((sum, inv) => sum + (parseFloat(inv.value) || 0), 0);
        return {
            listingId,
            month,
            dateStart,
            dateEnd,
            grossRevenue: Math.round(grossRevenue * 100) / 100,
            commissionPercent,
            commissionTotal: Math.round(commissionTotal * 100) / 100,
            cleaningFees: Math.round(cleaningFees * 100) / 100,
            netPayout: Math.round(netPayout * 100) / 100,
            bookingCount,
            invoiceCount: invoices.length,
            invoiceTotal: Math.round(invoiceTotal * 100) / 100,
            dataSource: hostawayFiltered.length > 0 ? 'hostaway' : 'hostkit'
        };
    }
    catch (error) {
        console.error("Error in getMonthlyPerformanceService:", error);
        throw new Error("Failed to fetch monthly performance data");
    }
};
exports.getMonthlyPerformanceService = getMonthlyPerformanceService;
