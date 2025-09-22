"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHostawayDailyCalendar = exports.updateHostawayCalendarAvailability = exports.getHostawayExpenses = exports.downloadHostawayOwnerStatementCSV = exports.downloadHostawayOwnerStatementPDF = exports.getHostawayOwnerStatement = exports.getHostawayOwnerStatements = exports.respondToHostawayReview = exports.getHostawayReviews = exports.bulkUpdateHostawayCOACOD = exports.bulkUpdateHostawayCleaning = exports.bulkUpdateHostawayMaintenance = exports.updateHostawayCOACOD = exports.updateHostawayCleaning = exports.updateHostawayMaintenance = exports.bulkUpdateHostawayMinimumStay = exports.bulkUpdateHostawayPricing = exports.updateHostawayCheckInOut = exports.updateHostawayMinimumStay = exports.updateHostawayPricing = exports.getHostawayReservations = exports.updateHostawayCalendar = exports.getHostawayCalendarMonth = exports.getHostawayCalendarDate = exports.getHostawayCalendar = exports.createHostawayCreditNote = exports.getHostawayCreditNotes = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const HOSTAWAY_TOKEN = process.env.HOSTAWAY_TOKEN;
const HOSTAWAY_BASE_URL = process.env.HOSTAWAY_API_BASE || "https://api.hostaway.com/v1";
const getHostawayCreditNotes = async (listingId, status) => {
    try {
        const params = {};
        if (status && status !== 'all') {
            params.status = status;
        }
        console.log('Fetching Hostaway credit notes:', {
            listingId,
            status,
            url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/creditNotes`
        });
        const { data } = await axios_1.default.get(`${HOSTAWAY_BASE_URL}/listings/${listingId}/creditNotes`, {
            headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` },
            params
        });
        return data.data || [];
    }
    catch (error) {
        console.error('Error fetching Hostaway credit notes:', error.response?.data || error.message);
        // Return empty array if API fails
        return [];
    }
};
exports.getHostawayCreditNotes = getHostawayCreditNotes;
const createHostawayCreditNote = async (listingId, creditNoteData) => {
    try {
        console.log('Creating Hostaway credit note:', {
            listingId,
            action: creditNoteData.action || 'create',
            url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/creditNotes`
        });
        const { data } = await axios_1.default.post(`${HOSTAWAY_BASE_URL}/listings/${listingId}/creditNotes`, creditNoteData, {
            headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` }
        });
        return data.data;
    }
    catch (error) {
        console.error('Error creating Hostaway credit note:', error.response?.data || error.message);
        throw new Error(`Failed to create credit note: ${error.message}`);
    }
};
exports.createHostawayCreditNote = createHostawayCreditNote;
const getHostawayCalendar = async (listingId, startDate, endDate) => {
    try {
        console.log('Fetching Hostaway calendar with pricing:', {
            listingId,
            startDate,
            endDate,
            url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
        });
        const { data } = await axios_1.default.get(`${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`, {
            headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` },
            params: {
                startDate,
                endDate
            }
        });
        console.log('Hostaway calendar response:', data);
        return data;
    }
    catch (error) {
        console.error("Error fetching Hostaway calendar:", error.response?.data || error.message);
        throw error;
    }
};
exports.getHostawayCalendar = getHostawayCalendar;
// Get calendar data with pricing and minimum nights for a specific date
const getHostawayCalendarDate = async (listingId, date) => {
    try {
        console.log('Fetching Hostaway calendar data for date:', {
            listingId,
            date,
            url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
        });
        const { data } = await axios_1.default.get(`${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`, {
            headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` },
            params: {
                startDate: date,
                endDate: date
            }
        });
        console.log('Hostaway calendar date response:', data);
        return data;
    }
    catch (error) {
        console.error('Error fetching Hostaway calendar date:', error.response?.data || error.message);
        throw error;
    }
};
exports.getHostawayCalendarDate = getHostawayCalendarDate;
// Get calendar data for a full month with pricing and minimum stay
const getHostawayCalendarMonth = async (listingId, year, month) => {
    try {
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
        console.log('Fetching Hostaway calendar month with pricing:', {
            listingId,
            year,
            month,
            startDate,
            endDate,
            url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
        });
        const { data } = await axios_1.default.get(`${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`, {
            headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` },
            params: {
                startDate,
                endDate
            }
        });
        console.log('Hostaway calendar month response:', data);
        return data;
    }
    catch (error) {
        console.error('Error fetching Hostaway calendar month:', error.response?.data || error.message);
        throw error;
    }
};
exports.getHostawayCalendarMonth = getHostawayCalendarMonth;
const updateHostawayCalendar = async (listingId, startDate, endDate, status) => {
    try {
        // Check if token is available
        if (!HOSTAWAY_TOKEN) {
            throw new Error("HOSTAWAY_TOKEN environment variable is not set");
        }
        console.log(`Updating Hostaway calendar for listing ${listingId}:`, {
            startDate,
            endDate,
            status,
            token: HOSTAWAY_TOKEN ? 'Present' : 'Missing'
        });
        // Try the correct Hostaway API endpoint for calendar updates
        // The endpoint might be different based on Hostaway API version
        const payload = {
            startDate,
            endDate,
            status: status === 'blocked' ? 'unavailable' : 'available',
            reason: status === 'blocked' ? 'Owner blocked' : 'Available for booking'
        };
        console.log('Hostaway API payload:', payload);
        const { data } = await axios_1.default.put(`${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`, payload, { headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` } });
        console.log('Hostaway calendar update response:', data);
        return data;
    }
    catch (error) {
        console.error("Error updating Hostaway calendar:", {
            error: error.message,
            response: error.response?.data,
            httpStatus: error.response?.status,
            listingId,
            startDate,
            endDate,
            status
        });
        throw error;
    }
};
exports.updateHostawayCalendar = updateHostawayCalendar;
const getHostawayReservations = async (listingId, dateStart, dateEnd) => {
    try {
        const { data } = await axios_1.default.get(`${HOSTAWAY_BASE_URL}/reservations`, {
            headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` },
            params: { listingId, dateStart, dateEnd }
        });
        return data;
    }
    catch (error) {
        console.error("Error fetching Hostaway reservations:", error.response?.data || error.message);
        throw error;
    }
};
exports.getHostawayReservations = getHostawayReservations;
// Update pricing for specific dates
const updateHostawayPricing = async (listingId, startDate, endDate, price) => {
    try {
        if (!HOSTAWAY_TOKEN) {
            throw new Error("HOSTAWAY_TOKEN environment variable is not set");
        }
        console.log('Updating Hostaway pricing:', {
            listingId,
            startDate,
            endDate,
            price,
            url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
        });
        const payload = {
            startDate,
            endDate,
            price
        };
        const { data } = await axios_1.default.put(`${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`, payload, {
            headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` }
        });
        return data;
    }
    catch (error) {
        console.error('Error updating Hostaway pricing:', error.response?.data || error.message);
        throw error;
    }
};
exports.updateHostawayPricing = updateHostawayPricing;
// Update minimum stay rules for specific dates
const updateHostawayMinimumStay = async (listingId, startDate, endDate, minimumStay) => {
    try {
        if (!HOSTAWAY_TOKEN) {
            throw new Error("HOSTAWAY_TOKEN environment variable is not set");
        }
        console.log('Updating Hostaway minimum stay:', {
            listingId,
            startDate,
            endDate,
            minimumStay,
            url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
        });
        const payload = {
            startDate,
            endDate,
            minimumStay
        };
        const { data } = await axios_1.default.put(`${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`, payload, {
            headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` }
        });
        return data;
    }
    catch (error) {
        console.error('Error updating Hostaway minimum stay:', error.response?.data || error.message);
        throw error;
    }
};
exports.updateHostawayMinimumStay = updateHostawayMinimumStay;
// Update check-in/check-out availability (COA/COD)
const updateHostawayCheckInOut = async (listingId, startDate, endDate, checkInAvailable, checkOutAvailable) => {
    try {
        if (!HOSTAWAY_TOKEN) {
            throw new Error("HOSTAWAY_TOKEN environment variable is not set");
        }
        console.log('Updating Hostaway check-in/out availability:', {
            listingId,
            startDate,
            endDate,
            checkInAvailable,
            checkOutAvailable,
            url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
        });
        const payload = {
            startDate,
            endDate,
            checkInAvailable,
            checkOutAvailable
        };
        const { data } = await axios_1.default.put(`${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`, payload, {
            headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` }
        });
        return data;
    }
    catch (error) {
        console.error('Error updating Hostaway check-in/out:', error.response?.data || error.message);
        throw error;
    }
};
exports.updateHostawayCheckInOut = updateHostawayCheckInOut;
// Bulk update multiple properties with pricing
const bulkUpdateHostawayPricing = async (properties, startDate, endDate, price) => {
    const results = [];
    for (const propertyId of properties) {
        try {
            const result = await (0, exports.updateHostawayPricing)(propertyId, startDate, endDate, price);
            results.push({ propertyId, success: true, data: result });
        }
        catch (error) {
            results.push({ propertyId, success: false, error: error.message });
        }
    }
    return results;
};
exports.bulkUpdateHostawayPricing = bulkUpdateHostawayPricing;
// Bulk update multiple properties with minimum stay
const bulkUpdateHostawayMinimumStay = async (properties, startDate, endDate, minimumStay) => {
    const results = [];
    for (const propertyId of properties) {
        try {
            const result = await (0, exports.updateHostawayMinimumStay)(propertyId, startDate, endDate, minimumStay);
            results.push({ propertyId, success: true, data: result });
        }
        catch (error) {
            results.push({ propertyId, success: false, error: error.message });
        }
    }
    return results;
};
exports.bulkUpdateHostawayMinimumStay = bulkUpdateHostawayMinimumStay;
// Update maintenance status for specific dates
const updateHostawayMaintenance = async (listingId, startDate, endDate, maintenanceType, description) => {
    try {
        if (!HOSTAWAY_TOKEN) {
            throw new Error("HOSTAWAY_TOKEN environment variable is not set");
        }
        console.log('Updating Hostaway maintenance:', {
            listingId,
            startDate,
            endDate,
            maintenanceType,
            description,
            url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
        });
        const payload = {
            startDate,
            endDate,
            status: 'unavailable',
            reason: `Maintenance: ${maintenanceType}`,
            description: description || `Scheduled maintenance: ${maintenanceType}`,
            maintenanceType
        };
        const { data } = await axios_1.default.put(`${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`, payload, {
            headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` }
        });
        return data;
    }
    catch (error) {
        console.error('Error updating Hostaway maintenance:', error.response?.data || error.message);
        throw error;
    }
};
exports.updateHostawayMaintenance = updateHostawayMaintenance;
// Update cleaning status for specific dates
const updateHostawayCleaning = async (listingId, startDate, endDate, cleaningType, description) => {
    try {
        if (!HOSTAWAY_TOKEN) {
            throw new Error("HOSTAWAY_TOKEN environment variable is not set");
        }
        console.log('Updating Hostaway cleaning:', {
            listingId,
            startDate,
            endDate,
            cleaningType,
            description,
            url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
        });
        const payload = {
            startDate,
            endDate,
            status: 'unavailable',
            reason: `Cleaning: ${cleaningType}`,
            description: description || `Scheduled cleaning: ${cleaningType}`,
            cleaningType
        };
        const { data } = await axios_1.default.put(`${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`, payload, {
            headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` }
        });
        return data;
    }
    catch (error) {
        console.error('Error updating Hostaway cleaning:', error.response?.data || error.message);
        throw error;
    }
};
exports.updateHostawayCleaning = updateHostawayCleaning;
// Update check-in/check-out availability (COA/COD) - Enhanced version
const updateHostawayCOACOD = async (listingId, startDate, endDate, checkInAvailable, checkOutAvailable, reason) => {
    try {
        if (!HOSTAWAY_TOKEN) {
            throw new Error("HOSTAWAY_TOKEN environment variable is not set");
        }
        console.log('Updating Hostaway COA/COD:', {
            listingId,
            startDate,
            endDate,
            checkInAvailable,
            checkOutAvailable,
            reason,
            url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`
        });
        const payload = {
            startDate,
            endDate,
            checkInAvailable,
            checkOutAvailable,
            reason: reason || `Check-in: ${checkInAvailable ? 'Available' : 'Not Available'}, Check-out: ${checkOutAvailable ? 'Available' : 'Not Available'}`,
            description: `COA/COD Control - Check-in: ${checkInAvailable ? 'Yes' : 'No'}, Check-out: ${checkOutAvailable ? 'Yes' : 'No'}`
        };
        const { data } = await axios_1.default.put(`${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`, payload, {
            headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` }
        });
        return data;
    }
    catch (error) {
        console.error('Error updating Hostaway COA/COD:', error.response?.data || error.message);
        throw error;
    }
};
exports.updateHostawayCOACOD = updateHostawayCOACOD;
// Bulk update multiple properties with maintenance
const bulkUpdateHostawayMaintenance = async (properties, startDate, endDate, maintenanceType, description) => {
    const results = [];
    for (const propertyId of properties) {
        try {
            const result = await (0, exports.updateHostawayMaintenance)(propertyId, startDate, endDate, maintenanceType, description);
            results.push({ propertyId, success: true, data: result });
        }
        catch (error) {
            results.push({ propertyId, success: false, error: error.message });
        }
    }
    return results;
};
exports.bulkUpdateHostawayMaintenance = bulkUpdateHostawayMaintenance;
// Bulk update multiple properties with cleaning
const bulkUpdateHostawayCleaning = async (properties, startDate, endDate, cleaningType, description) => {
    const results = [];
    for (const propertyId of properties) {
        try {
            const result = await (0, exports.updateHostawayCleaning)(propertyId, startDate, endDate, cleaningType, description);
            results.push({ propertyId, success: true, data: result });
        }
        catch (error) {
            results.push({ propertyId, success: false, error: error.message });
        }
    }
    return results;
};
exports.bulkUpdateHostawayCleaning = bulkUpdateHostawayCleaning;
// Bulk update multiple properties with COA/COD
const bulkUpdateHostawayCOACOD = async (properties, startDate, endDate, checkInAvailable, checkOutAvailable, reason) => {
    const results = [];
    for (const propertyId of properties) {
        try {
            const result = await (0, exports.updateHostawayCOACOD)(propertyId, startDate, endDate, checkInAvailable, checkOutAvailable, reason);
            results.push({ propertyId, success: true, data: result });
        }
        catch (error) {
            results.push({ propertyId, success: false, error: error.message });
        }
    }
    return results;
};
exports.bulkUpdateHostawayCOACOD = bulkUpdateHostawayCOACOD;
// Get reviews from Hostaway API
const getHostawayReviews = async (listingId, limit = 50, offset = 0) => {
    try {
        console.log('Fetching Hostaway reviews:', {
            listingId,
            limit,
            offset,
            url: `${HOSTAWAY_BASE_URL}/reviews`
        });
        const response = await axios_1.default.get(`${HOSTAWAY_BASE_URL}/reviews`, {
            headers: {
                'Authorization': `Bearer ${HOSTAWAY_TOKEN}`,
                'Content-Type': 'application/json'
            },
            params: {
                limit: 1000, // Get more reviews to filter properly
                offset: 0
                // Note: Hostaway API doesn't support listingId parameter filtering
            }
        });
        console.log('Hostaway reviews response:', response.data);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching Hostaway reviews:', {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: `${HOSTAWAY_BASE_URL}/listings/${listingId}/reviews`
        });
        throw error;
    }
};
exports.getHostawayReviews = getHostawayReviews;
// Respond to a Hostaway review
const respondToHostawayReview = async (reviewId, responseText) => {
    try {
        console.log('Responding to Hostaway review:', {
            reviewId,
            responseText,
            url: `${HOSTAWAY_BASE_URL}/reviews/${reviewId}/response`
        });
        const response = await axios_1.default.post(`${HOSTAWAY_BASE_URL}/reviews/${reviewId}/response`, {
            response: responseText
        }, {
            headers: {
                'Authorization': `Bearer ${HOSTAWAY_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Hostaway review response posted:', response.data);
        return response.data;
    }
    catch (error) {
        console.error('Error responding to Hostaway review:', error.response?.data || error.message);
        throw error;
    }
};
exports.respondToHostawayReview = respondToHostawayReview;
// Get owner statements from Hostaway API
const getHostawayOwnerStatements = async (listingId, startDate, endDate, limit = 50, offset = 0) => {
    try {
        console.log('Fetching Hostaway owner statements:', {
            listingId,
            startDate,
            endDate,
            limit,
            offset,
            url: `${HOSTAWAY_BASE_URL}/ownerStatements`
        });
        const params = {
            limit,
            offset
        };
        if (listingId) {
            params.listingId = listingId;
        }
        if (startDate) {
            params.startDate = startDate;
        }
        if (endDate) {
            params.endDate = endDate;
        }
        const response = await axios_1.default.get(`${HOSTAWAY_BASE_URL}/ownerStatements`, {
            headers: {
                'Authorization': `Bearer ${HOSTAWAY_TOKEN}`,
                'Content-Type': 'application/json'
            },
            params
        });
        console.log('Hostaway owner statements response:', response.data);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching Hostaway owner statements:', {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: `${HOSTAWAY_BASE_URL}/ownerStatements`
        });
        throw error;
    }
};
exports.getHostawayOwnerStatements = getHostawayOwnerStatements;
// Get specific owner statement by ID
const getHostawayOwnerStatement = async (statementId) => {
    try {
        console.log('Fetching Hostaway owner statement:', {
            statementId,
            url: `${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}`
        });
        const response = await axios_1.default.get(`${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}`, {
            headers: {
                'Authorization': `Bearer ${HOSTAWAY_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Hostaway owner statement response:', response.data);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching Hostaway owner statement:', {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: `${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}`
        });
        throw error;
    }
};
exports.getHostawayOwnerStatement = getHostawayOwnerStatement;
// Download owner statement as PDF
const downloadHostawayOwnerStatementPDF = async (statementId) => {
    try {
        console.log('Downloading Hostaway owner statement PDF:', {
            statementId,
            url: `${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}/pdf`
        });
        const response = await axios_1.default.get(`${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}/pdf`, {
            headers: {
                'Authorization': `Bearer ${HOSTAWAY_TOKEN}`,
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        });
        console.log('Hostaway owner statement PDF downloaded');
        return response.data;
    }
    catch (error) {
        console.error('Error downloading Hostaway owner statement PDF:', {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: `${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}/pdf`
        });
        throw error;
    }
};
exports.downloadHostawayOwnerStatementPDF = downloadHostawayOwnerStatementPDF;
// Download owner statement as CSV
const downloadHostawayOwnerStatementCSV = async (statementId) => {
    try {
        console.log('Downloading Hostaway owner statement CSV:', {
            statementId,
            url: `${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}/csv`
        });
        const response = await axios_1.default.get(`${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}/csv`, {
            headers: {
                'Authorization': `Bearer ${HOSTAWAY_TOKEN}`,
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        });
        console.log('Hostaway owner statement CSV downloaded');
        return response.data;
    }
    catch (error) {
        console.error('Error downloading Hostaway owner statement CSV:', {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: `${HOSTAWAY_BASE_URL}/ownerStatements/${statementId}/csv`
        });
        throw error;
    }
};
exports.downloadHostawayOwnerStatementCSV = downloadHostawayOwnerStatementCSV;
// Get expenses and extras from Hostaway
const getHostawayExpenses = async (listingId, startDate, endDate, limit = 100, offset = 0) => {
    try {
        console.log('Fetching Hostaway expenses:', {
            listingId,
            startDate,
            endDate,
            limit,
            offset,
            url: `${HOSTAWAY_BASE_URL}/expensesExtras`
        });
        const params = {
            limit,
            offset
        };
        if (listingId) {
            params.listingMapId = listingId;
        }
        if (startDate) {
            params.startDate = startDate;
        }
        if (endDate) {
            params.endDate = endDate;
        }
        const response = await axios_1.default.get(`${HOSTAWAY_BASE_URL}/expensesExtras`, {
            headers: {
                'Authorization': `Bearer ${HOSTAWAY_TOKEN}`,
                'Content-Type': 'application/json'
            },
            params
        });
        console.log('Hostaway expenses response:', response.data);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching Hostaway expenses:', {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: `${HOSTAWAY_BASE_URL}/expensesExtras`
        });
        throw error;
    }
};
exports.getHostawayExpenses = getHostawayExpenses;
// Update calendar availability (block/unblock dates)
const updateHostawayCalendarAvailability = async (listingId, startDate, endDate, isAvailable) => {
    try {
        console.log('Calling Hostaway calendar availability update:', {
            listingId,
            startDate,
            endDate,
            isAvailable
        });
        const { data } = await axios_1.default.put(`${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`, {
            startDate,
            endDate,
            isAvailable,
            note: isAvailable === 1 ? "Unblocked via Owner Portal" : "Blocked via Owner Portal"
        }, {
            headers: {
                Authorization: `Bearer ${HOSTAWAY_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Hostaway calendar availability update response:', data);
        return data;
    }
    catch (error) {
        console.error("Error updating Hostaway calendar availability:", error.response?.data || error.message);
        throw error;
    }
};
exports.updateHostawayCalendarAvailability = updateHostawayCalendarAvailability;
// Get real-time daily calendar data with pricing and availability
const getHostawayDailyCalendar = async (listingId, startDate, endDate) => {
    try {
        console.log('Fetching Hostaway daily calendar:', {
            listingId,
            startDate,
            endDate
        });
        const { data } = await axios_1.default.get(`${HOSTAWAY_BASE_URL}/listings/${listingId}/calendar`, {
            headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` },
            params: {
                startDate,
                endDate
            }
        });
        console.log('Hostaway daily calendar response:', data);
        console.log('Hostaway response dates:', data.result?.map((d) => d.date) || 'No result');
        return data;
    }
    catch (error) {
        console.error('Error fetching Hostaway daily calendar:', error.response?.data || error.message);
        throw error;
    }
};
exports.getHostawayDailyCalendar = getHostawayDailyCalendar;
