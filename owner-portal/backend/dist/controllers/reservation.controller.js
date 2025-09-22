"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReservationsSummary = exports.getReservation = exports.getReservations = void 0;
const hostkit_api_1 = require("../integrations/hostkit.api");
// Get all reservations for a property with optional date filtering
const getReservations = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { startDate, endDate, get_archived, from_date } = req.query;
        if (!propertyId) {
            return res.status(400).json({
                success: false,
                error: 'Property ID is required'
            });
        }
        // Use provided dates or default to current month
        const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];
        console.log('Fetching reservations:', {
            propertyId: parseInt(propertyId),
            startDate: start,
            endDate: end,
            get_archived: get_archived || false,
            from_date: from_date || null
        });
        const reservations = await (0, hostkit_api_1.getHostkitReservations)(parseInt(propertyId), start, end);
        // Apply additional filters if provided
        let filteredReservations = reservations;
        // Filter by archived status if specified
        if (get_archived !== undefined) {
            const includeArchived = get_archived === 'true';
            filteredReservations = reservations.filter((reservation) => includeArchived ? reservation.archived : !reservation.archived);
        }
        // Filter by from_date if specified
        if (from_date) {
            const fromDate = new Date(from_date);
            filteredReservations = filteredReservations.filter((reservation) => {
                const checkinDate = new Date(reservation.checkin || reservation.arrivalDate);
                return checkinDate >= fromDate;
            });
        }
        res.json({
            success: true,
            data: filteredReservations,
            meta: {
                propertyId: parseInt(propertyId),
                startDate: start,
                endDate: end,
                total: filteredReservations.length,
                filters: {
                    get_archived: get_archived || false,
                    from_date: from_date || null
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch reservations'
        });
    }
};
exports.getReservations = getReservations;
// Get a specific reservation by reservation code
const getReservation = async (req, res) => {
    try {
        const { propertyId, reservationCode } = req.params;
        if (!propertyId || !reservationCode) {
            return res.status(400).json({
                success: false,
                error: 'Property ID and reservation code are required'
            });
        }
        console.log('Fetching single reservation:', {
            propertyId: parseInt(propertyId),
            reservationCode
        });
        const reservation = await (0, hostkit_api_1.getHostkitReservation)(parseInt(propertyId), reservationCode);
        res.json({
            success: true,
            data: reservation,
            meta: {
                propertyId: parseInt(propertyId),
                reservationCode
            }
        });
    }
    catch (error) {
        console.error('Error fetching reservation:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch reservation'
        });
    }
};
exports.getReservation = getReservation;
// Get reservations summary/statistics
const getReservationsSummary = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { startDate, endDate } = req.query;
        if (!propertyId) {
            return res.status(400).json({
                success: false,
                error: 'Property ID is required'
            });
        }
        const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];
        const reservations = await (0, hostkit_api_1.getHostkitReservations)(parseInt(propertyId), start, end);
        // Calculate summary statistics
        const summary = {
            total: reservations.length,
            confirmed: reservations.filter((r) => r.status === 'confirmed' || r.status === 'Confirmed').length,
            pending: reservations.filter((r) => r.status === 'pending' || r.status === 'Pending').length,
            cancelled: reservations.filter((r) => r.status === 'cancelled' || r.status === 'Cancelled').length,
            totalRevenue: reservations.reduce((sum, r) => sum + (parseFloat(r.totalAmount) || 0), 0),
            averageStay: reservations.length > 0 ?
                reservations.reduce((sum, r) => {
                    const checkin = new Date(r.checkin || r.arrivalDate);
                    const checkout = new Date(r.checkout || r.departureDate);
                    return sum + Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));
                }, 0) / reservations.length : 0,
            occupancyRate: 0 // This would need property capacity data to calculate properly
        };
        res.json({
            success: true,
            data: summary,
            meta: {
                propertyId: parseInt(propertyId),
                startDate: start,
                endDate: end,
                generatedAt: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Error fetching reservations summary:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch reservations summary'
        });
    }
};
exports.getReservationsSummary = getReservationsSummary;
