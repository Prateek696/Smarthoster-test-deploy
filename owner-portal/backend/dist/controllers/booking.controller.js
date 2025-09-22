"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listHostawayProperties = exports.debugPropertyApiKeys = exports.getBookingsDebug = exports.getBookingDetail = exports.getBookings = exports.updateCalendar = exports.getCalendar = void 0;
const booking_service_1 = require("../services/booking.service");
const getCalendar = async (req, res) => {
    const listingId = parseInt(req.params.listingId);
    const { startDate, endDate } = req.query;
    try {
        const calendar = await (0, booking_service_1.getCalendarService)(listingId, startDate, endDate);
        res.json(calendar);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching calendar" });
    }
};
exports.getCalendar = getCalendar;
const updateCalendar = async (req, res) => {
    const listingId = parseInt(req.params.listingId);
    const { startDate, endDate, status } = req.body;
    try {
        const result = await (0, booking_service_1.updateCalendarService)(listingId, startDate, endDate, status);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating calendar" });
    }
};
exports.updateCalendar = updateCalendar;
const getBookings = async (req, res) => {
    const listingId = parseInt(req.params.listingId);
    const { dateStart, dateEnd } = req.query;
    try {
        const bookings = await (0, booking_service_1.getBookingsService)(listingId, dateStart, dateEnd);
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching bookings",
            error: error.message,
            propertyId: listingId
        });
    }
};
exports.getBookings = getBookings;
const getBookingDetail = async (req, res) => {
    const { bookingId } = req.params;
    const { propertyId } = req.query;
    try {
        if (!propertyId) {
            return res.status(400).json({ message: "Property ID is required" });
        }
        const listingId = parseInt(propertyId);
        const booking = await (0, booking_service_1.getBookingDetailService)(listingId, bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching booking details",
            error: error.message,
            bookingId
        });
    }
};
exports.getBookingDetail = getBookingDetail;
const getBookingsDebug = async (req, res) => {
    const listingId = parseInt(req.params.listingId);
    const { dateStart, dateEnd } = req.query;
    try {
        // Import the API function here to get raw data
        const { getHostawayReservations } = require("../integrations/hostaway.api");
        const rawData = await getHostawayReservations(listingId, dateStart || "2025-07-01", dateEnd || "2025-07-31");
        const debugInfo = {
            listingId,
            dateRange: { dateStart: dateStart || "2025-07-01", dateEnd: dateEnd || "2025-07-31" },
            rawApiResponse: rawData,
            firstBookingFields: rawData?.result?.[0] ? Object.keys(rawData.result[0]) : [],
            firstBookingSample: rawData?.result?.[0] || null,
            emailFieldAnalysis: {
                guestEmail: rawData?.result?.[0]?.guestEmail || "NOT_FOUND",
                guestEmailStatus: rawData?.result?.[0]?.guestEmail === null ? "NULL" : rawData?.result?.[0]?.guestEmail === "" ? "EMPTY" : "HAS_VALUE"
            },
            totalCount: rawData?.result?.length || 0
        };
        res.json(debugInfo);
    }
    catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack,
            listingId,
            dateRange: { dateStart, dateEnd }
        });
    }
};
exports.getBookingsDebug = getBookingsDebug;
const debugPropertyApiKeys = async (req, res) => {
    try {
        const { getHostkitApiKey, getHostkitId } = require("../utils/propertyApiKey");
        const { env } = require("../config/env");
        const propertyId = parseInt(req.params.propertyId) || 392782;
        // Test API key retrieval
        const hostkitId = await getHostkitId(propertyId);
        const apiKey = await getHostkitApiKey(propertyId);
        // Test all configured API keys
        const allApiKeys = {
            "10027": env.hostkit.apiKeys["10027"] ? "SET" : "NOT SET",
            "10028": env.hostkit.apiKeys["10028"] ? "SET" : "NOT SET",
            "10029": env.hostkit.apiKeys["10029"] ? "SET" : "NOT SET",
            "10030": env.hostkit.apiKeys["10030"] ? "SET" : "NOT SET",
            "10031": env.hostkit.apiKeys["10031"] ? "SET" : "NOT SET",
            "10032": env.hostkit.apiKeys["10032"] ? "SET" : "NOT SET",
            "12602": env.hostkit.apiKeys["12602"] ? "SET" : "NOT SET"
        };
        const debugInfo = {
            propertyId,
            hostkitId,
            apiKeyStatus: apiKey ? "SET" : "NOT SET",
            apiKeyLength: apiKey ? apiKey.length : 0,
            apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + "..." : "N/A",
            allApiKeysStatus: allApiKeys,
            envCheck: {
                hasHostkitUrl: !!env.hostkit.apiUrl,
                hostawayAccountId: env.hostaway.accountId ? "SET" : "NOT SET",
                hostawayToken: env.hostaway.token ? "SET" : "NOT SET"
            }
        };
        res.json(debugInfo);
    }
    catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};
exports.debugPropertyApiKeys = debugPropertyApiKeys;
const listHostawayProperties = async (req, res) => {
    try {
        const axios = require('axios');
        const { env } = require("../config/env");
        // Get all properties from Hostaway
        const response = await axios.get('https://api.hostaway.com/v1/listings', {
            headers: {
                'Authorization': `Bearer ${env.hostaway.token}`,
                'Content-Type': 'application/json'
            }
        });
        const properties = response.data.result || [];
        const debugInfo = {
            totalProperties: properties.length,
            availablePropertyIds: properties.map((prop) => ({
                id: prop.id,
                name: prop.name || prop.internalListingName || prop.externalListingName,
                address: prop.address?.full || 'No address',
                status: prop.status
            })),
            configuredPropertyIds: [392776, 392777, 392778, 392779, 392780, 392781, 392782],
            missingProperties: [392776, 392777, 392778, 392779, 392780, 392781, 392782].filter(id => !properties.find((prop) => prop.id === id)),
            envCheck: {
                hostawayToken: env.hostaway.token ? `SET (${env.hostaway.token.substring(0, 10)}...)` : "NOT SET",
                hostawayAccountId: env.hostaway.accountId || "NOT SET"
            }
        };
        res.json(debugInfo);
    }
    catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack,
            statusCode: error.response?.status,
            statusText: error.response?.statusText
        });
    }
};
exports.listHostawayProperties = listHostawayProperties;
