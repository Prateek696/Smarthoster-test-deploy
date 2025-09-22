"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchExpenses = fetchExpenses;
const axios_1 = __importDefault(require("axios"));
const propertyApiKey_1 = require("../utils/propertyApiKey");
const HOSTKIT_API_URL = process.env.HOSTKIT_API_URL;
async function fetchExpenses(propertyId, year, month, startDate, endDate) {
    let dateStart;
    let dateEnd;
    console.log('fetchExpenses called with:', { propertyId, year, month, startDate, endDate });
    if (startDate && endDate) {
        // Use provided date range
        dateStart = Math.floor(new Date(startDate).getTime() / 1000);
        dateEnd = Math.floor(new Date(endDate).getTime() / 1000);
        console.log('Using provided date range:', { startDate, endDate, dateStart, dateEnd });
    }
    else if (year && month) {
        // Use year/month
        dateStart = Math.floor(new Date(year, month - 1, 1).getTime() / 1000);
        dateEnd = Math.floor(new Date(year, month, 0, 23, 59, 59).getTime() / 1000);
        console.log('Using year/month:', { year, month, dateStart, dateEnd });
    }
    else {
        // Default to current month
        const now = new Date();
        dateStart = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
        dateEnd = Math.floor(new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime() / 1000);
        console.log('Using default current month:', { now: now.toISOString(), dateStart, dateEnd });
    }
    // Validate dates
    if (isNaN(dateStart) || isNaN(dateEnd)) {
        console.error('Invalid date calculation:', { dateStart, dateEnd });
        return [];
    }
    try {
        const propertyApiKey = await (0, propertyApiKey_1.getHostkitApiKey)(propertyId);
        if (!propertyApiKey) {
            console.error(`No API key found for property ${propertyId}`);
            return [];
        }
        const url = `${HOSTKIT_API_URL}/getExpenses`;
        const response = await axios_1.default.get(url, {
            params: {
                APIKEY: propertyApiKey,
                date_start: dateStart,
                date_end: dateEnd,
            },
        });
        const data = response.data;
        console.log('Raw Hostkit response:', data);
        // According to API docs, response is always an array
        if (!Array.isArray(data)) {
            console.log('Invalid response format - expected array');
            return [];
        }
        console.log(`Found ${data.length} expenses`);
        return data.map((e) => ({
            id: e.id || '',
            active: e.active || '0',
            category: e.category || '',
            type: e.type || '',
            vendor: e.vendor || '',
            description: e.description || '',
            number: e.number || '',
            amount: e.amount || '0.00',
            vat: e.vat || '0',
            documentDate: e.document_date || '',
            creationDate: e.creation_date || '',
            paymentDate: e.payment_date || '',
            lastUpdateDate: e.last_update_date || '',
            lines: (e.lines || []).map((line) => ({
                lineId: line.line_id || '',
                lineDescription: line.line_description || '',
                lineAmount: line.line_amount || '0.00',
                lineVat: line.line_vat || '0',
            })),
        }));
    }
    catch (error) {
        console.error('Error fetching expenses from Hostkit:', error.response?.data || error.message);
        return [];
    }
}
