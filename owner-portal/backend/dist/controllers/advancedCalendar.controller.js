"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBulkOperation = exports.getBulkOperations = exports.deleteAdvancedCalendarEvent = exports.updateAdvancedCalendarEvent = exports.createAdvancedCalendarEvent = exports.getAdvancedCalendarEvents = void 0;
const hostaway_api_1 = require("../integrations/hostaway.api");
const hostkit_api_1 = require("../integrations/hostkit.api");
// Get advanced calendar events (bookings, blocks, pricing)
const getAdvancedCalendarEvents = async (req, res) => {
    try {
        const { propertyId, startDate, endDate } = req.query;
        console.log('Advanced Calendar Events Request:', { propertyId, startDate, endDate });
        if (!propertyId || !startDate || !endDate) {
            return res.status(400).json({
                message: "propertyId, startDate, and endDate are required"
            });
        }
        const listingId = parseInt(propertyId);
        console.log('Parsed listingId:', listingId);
        // Get calendar data from Hostaway
        let hostawayCalendar = { result: [] };
        try {
            hostawayCalendar = await (0, hostaway_api_1.getHostawayCalendar)(listingId, startDate, endDate);
            console.log('Hostaway calendar data:', {
                hasResult: !!hostawayCalendar.result,
                resultLength: hostawayCalendar.result?.length || 0
            });
        }
        catch (error) {
            console.warn('Hostaway calendar not available:', error);
        }
        // Get reservations from Hostaway
        let hostawayReservations = { data: [] };
        try {
            hostawayReservations = await (0, hostaway_api_1.getHostawayReservations)(listingId, startDate, endDate);
            console.log('Hostaway reservations data:', {
                hasData: !!hostawayReservations.data,
                dataLength: hostawayReservations.data?.length || 0
            });
        }
        catch (error) {
            console.warn('Hostaway reservations not available:', error);
        }
        // Get reservations from Hostkit (if available)
        let hostkitReservations = [];
        try {
            hostkitReservations = await (0, hostkit_api_1.getHostkitReservations)(listingId, startDate, endDate);
            console.log('Hostkit reservations data:', {
                length: hostkitReservations?.length || 0
            });
        }
        catch (error) {
            console.warn('Hostkit reservations not available:', error);
        }
        // Process calendar events
        const events = [];
        // Process Hostaway calendar data
        if (hostawayCalendar.result && Array.isArray(hostawayCalendar.result)) {
            hostawayCalendar.result.forEach((item) => {
                try {
                    if (item.status === 'unavailable' || item.status === 'blocked') {
                        events.push({
                            id: `block-${item.date || item.startDate || 'unknown'}-${listingId}`,
                            propertyId: listingId,
                            propertyName: `Property ${listingId}`,
                            type: 'block',
                            title: 'Blocked Dates',
                            description: item.reason || 'Blocked by owner',
                            startDate: item.date || item.startDate || new Date().toISOString().split('T')[0],
                            endDate: item.endDate || item.date || new Date().toISOString().split('T')[0],
                            status: 'active',
                            createdBy: 'Owner',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            source: 'hostaway',
                            externalId: item.id ? item.id.toString() : undefined
                        });
                    }
                    else if (item.price) {
                        events.push({
                            id: `price-${item.date || item.startDate || 'unknown'}-${listingId}`,
                            propertyId: listingId,
                            propertyName: `Property ${listingId}`,
                            type: 'price_update',
                            title: 'Price Update',
                            description: `Price set to €${item.price}`,
                            startDate: item.date || item.startDate || new Date().toISOString().split('T')[0],
                            endDate: item.endDate || item.date || new Date().toISOString().split('T')[0],
                            price: item.price,
                            status: 'active',
                            createdBy: 'Owner',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            source: 'hostaway',
                            externalId: item.id ? item.id.toString() : undefined
                        });
                    }
                }
                catch (itemError) {
                    console.warn('Error processing calendar item:', itemError, item);
                }
            });
        }
        // Process Hostaway reservations
        if (hostawayReservations.data && Array.isArray(hostawayReservations.data)) {
            hostawayReservations.data.forEach((reservation) => {
                events.push({
                    id: `booking-${reservation.id || 'unknown'}`,
                    propertyId: listingId,
                    propertyName: `Property ${listingId}`,
                    type: 'booking',
                    title: `Booking #${reservation.id || 'Unknown'}`,
                    description: `Guest: ${reservation.guestName || 'Unknown'}`,
                    startDate: reservation.arrivalDate || reservation.startDate,
                    endDate: reservation.departureDate || reservation.endDate,
                    price: reservation.totalPrice || reservation.price,
                    status: reservation.status === 'confirmed' ? 'active' : 'pending',
                    createdBy: 'Guest',
                    createdAt: reservation.createdDate || new Date().toISOString(),
                    updatedAt: reservation.modifiedDate || new Date().toISOString(),
                    source: 'hostaway',
                    externalId: reservation.id ? reservation.id.toString() : undefined
                });
            });
        }
        // Process Hostkit reservations
        if (hostkitReservations && Array.isArray(hostkitReservations)) {
            hostkitReservations.forEach((reservation) => {
                events.push({
                    id: `hostkit-booking-${reservation.id || 'unknown'}`,
                    propertyId: listingId,
                    propertyName: `Property ${listingId}`,
                    type: 'booking',
                    title: `Hostkit Booking #${reservation.id || 'Unknown'}`,
                    description: `Guest: ${reservation.guestName || 'Unknown'}`,
                    startDate: reservation.checkInDate || reservation.startDate,
                    endDate: reservation.checkOutDate || reservation.endDate,
                    price: reservation.totalAmount || reservation.price,
                    status: reservation.status === 'confirmed' ? 'active' : 'pending',
                    createdBy: 'Guest',
                    createdAt: reservation.createdAt || new Date().toISOString(),
                    updatedAt: reservation.updatedAt || new Date().toISOString(),
                    source: 'hostkit',
                    externalId: reservation.id ? reservation.id.toString() : undefined
                });
            });
        }
        res.json({
            success: true,
            events: events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
            total: events.length,
            sources: {
                hostaway: events.filter(e => e.source === 'hostaway').length,
                hostkit: events.filter(e => e.source === 'hostkit').length
            }
        });
    }
    catch (error) {
        console.error('Advanced calendar events error:', error);
        res.status(500).json({
            message: "Failed to fetch advanced calendar events",
            error: error.message
        });
    }
};
exports.getAdvancedCalendarEvents = getAdvancedCalendarEvents;
// Create a new calendar event
const createAdvancedCalendarEvent = async (req, res) => {
    try {
        const { propertyId, type, title, description, startDate, endDate, price, minimumStay } = req.body;
        if (!propertyId || !type || !title || !startDate || !endDate) {
            return res.status(400).json({
                message: "propertyId, type, title, startDate, and endDate are required"
            });
        }
        const listingId = parseInt(propertyId);
        // Create event based on type
        if (type === 'block') {
            // Block dates on Hostaway
            await (0, hostaway_api_1.updateHostawayCalendar)(listingId, startDate, endDate, 'blocked');
            // Mirror to Hostkit if available
            try {
                await (0, hostkit_api_1.updateHostkitCalendar)(listingId, startDate, endDate, 'blocked');
            }
            catch (error) {
                console.warn('Hostkit calendar update failed:', error);
            }
        }
        else if (type === 'price_update' && price) {
            // Update pricing on Hostaway
            // Note: This would require a specific pricing API endpoint
            console.log('Price update requested:', { listingId, startDate, endDate, price });
        }
        const event = {
            id: `${type}-${Date.now()}-${listingId}`,
            propertyId: listingId,
            propertyName: `Property ${listingId}`,
            type,
            title,
            description: description || '',
            startDate,
            endDate,
            price: price || undefined,
            minimumStay: minimumStay || undefined,
            status: 'active',
            createdBy: 'Owner',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: 'manual'
        };
        res.json({
            success: true,
            event,
            message: 'Event created successfully'
        });
    }
    catch (error) {
        console.error('Create advanced calendar event error:', error);
        res.status(500).json({
            message: "Failed to create calendar event",
            error: error.message
        });
    }
};
exports.createAdvancedCalendarEvent = createAdvancedCalendarEvent;
// Update an existing calendar event
const updateAdvancedCalendarEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { title, description, startDate, endDate, price, minimumStay } = req.body;
        // For now, we'll just return the updated event
        // In a real implementation, you'd update the external APIs
        const event = {
            id: eventId,
            title: title || 'Updated Event',
            description: description || '',
            startDate: startDate || new Date().toISOString().split('T')[0],
            endDate: endDate || new Date().toISOString().split('T')[0],
            price: price || undefined,
            minimumStay: minimumStay || undefined,
            updatedAt: new Date().toISOString()
        };
        res.json({
            success: true,
            event,
            message: 'Event updated successfully'
        });
    }
    catch (error) {
        console.error('Update advanced calendar event error:', error);
        res.status(500).json({
            message: "Failed to update calendar event",
            error: error.message
        });
    }
};
exports.updateAdvancedCalendarEvent = updateAdvancedCalendarEvent;
// Delete a calendar event
const deleteAdvancedCalendarEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        // For now, we'll just return success
        // In a real implementation, you'd delete from external APIs
        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete advanced calendar event error:', error);
        res.status(500).json({
            message: "Failed to delete calendar event",
            error: error.message
        });
    }
};
exports.deleteAdvancedCalendarEvent = deleteAdvancedCalendarEvent;
// Get bulk operations
const getBulkOperations = async (req, res) => {
    try {
        // For now, return empty array
        // In a real implementation, you'd fetch from a database
        res.json({
            success: true,
            operations: []
        });
    }
    catch (error) {
        console.error('Get bulk operations error:', error);
        res.status(500).json({
            message: "Failed to fetch bulk operations",
            error: error.message
        });
    }
};
exports.getBulkOperations = getBulkOperations;
// Create bulk operation
const createBulkOperation = async (req, res) => {
    try {
        const { type, properties, dates, parameters } = req.body;
        if (!type || !properties || !dates) {
            return res.status(400).json({
                message: "type, properties, and dates are required"
            });
        }
        console.log('Processing bulk operation:', { type, properties, dates, parameters });
        const operation = {
            id: `bulk-${Date.now()}`,
            type,
            properties,
            dates,
            parameters: parameters || {},
            status: 'processing',
            createdAt: new Date().toISOString(),
            completedAt: '',
            results: {
                success: 0,
                failed: 0,
                errors: []
            }
        };
        // Process each property and date combination
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };
        for (const propertyId of properties) {
            for (const dateRange of dates) {
                try {
                    if (type === 'block_dates') {
                        // Block dates in Hostaway
                        await (0, hostaway_api_1.updateHostawayCalendar)(propertyId, dateRange.startDate, dateRange.endDate, 'blocked');
                        results.success++;
                        console.log(`✅ Blocked ${dateRange.startDate} to ${dateRange.endDate} for property ${propertyId}`);
                    }
                    else if (type === 'unblock_dates') {
                        // Unblock dates in Hostaway
                        await (0, hostaway_api_1.updateHostawayCalendar)(propertyId, dateRange.startDate, dateRange.endDate, 'available');
                        results.success++;
                        console.log(`✅ Unblocked ${dateRange.startDate} to ${dateRange.endDate} for property ${propertyId}`);
                    }
                    else if (type === 'price_update' && parameters?.price) {
                        // Update pricing in Hostaway (if supported)
                        // Note: This would require a different Hostaway API endpoint
                        console.log(`⚠️ Price update not yet implemented for property ${propertyId}`);
                        results.failed++;
                        results.errors.push(`Price update not implemented for property ${propertyId}`);
                    }
                }
                catch (error) {
                    results.failed++;
                    const errorMsg = `Property ${propertyId}, ${dateRange.startDate}-${dateRange.endDate}: ${error.message}`;
                    results.errors.push(errorMsg);
                    console.error(`❌ Failed for property ${propertyId}:`, error.message);
                }
            }
        }
        // Update operation with results
        operation.status = results.failed === 0 ? 'completed' : 'completed_with_errors';
        operation.completedAt = new Date().toISOString();
        operation.results = results;
        console.log('Bulk operation completed:', results);
        res.json({
            success: true,
            operation,
            message: `Bulk operation completed: ${results.success} successful, ${results.failed} failed`
        });
    }
    catch (error) {
        console.error('Create bulk operation error:', error);
        res.status(500).json({
            message: "Failed to create bulk operation",
            error: error.message
        });
    }
};
exports.createBulkOperation = createBulkOperation;
