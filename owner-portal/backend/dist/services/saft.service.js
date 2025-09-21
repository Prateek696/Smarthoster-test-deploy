"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSaftService = void 0;
// saft.service.ts
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const propertyApiKey_1 = require("../utils/propertyApiKey");
// Note: Property to Hostkit ID mapping is now dynamic from database
// See getHostkitId() function in utils/propertyApiKey.ts
const getSaftService = async (request) => {
    const { propertyId, year, month, invoicingNif } = request;
    // Use the new dynamic API key system
    const apiKey = await (0, propertyApiKey_1.getHostkitApiKey)(parseInt(propertyId));
    if (!apiKey) {
        throw new Error(`No Hostkit API key configured for property ${propertyId}`);
    }
    // Get the Hostkit ID for this property (dynamic from database)
    const hostkitId = await (0, propertyApiKey_1.getHostkitId)(parseInt(propertyId));
    if (!hostkitId) {
        throw new Error(`No Hostkit ID configured for property ${propertyId}`);
    }
    // Validate inputs
    if (!invoicingNif || invoicingNif.length !== 9) {
        throw new Error('Invalid invoicing VAT ID. Must be 9 digits.');
    }
    if (year < 2020 || year > new Date().getFullYear() + 1) {
        throw new Error('Invalid year. Must be between 2020 and next year.');
    }
    if (month < 1 || month > 12) {
        throw new Error('Invalid month. Must be between 1 and 12.');
    }
    try {
        // Call Hostkit API
        const response = await axios_1.default.get(`${env_1.env.hostkit.apiUrl}/getSAFT`, {
            params: {
                APIKEY: apiKey,
                property_id: hostkitId,
                invoicing_nif: invoicingNif,
                year: year,
                month: month
            },
            timeout: 30000 // 30 second timeout
        });
        if (response.data && response.data.saft) {
            return {
                generated: response.data.generated || new Date().toISOString(),
                sent: response.data.sent || new Date().toISOString(),
                saft: response.data.saft
            };
        }
        else {
            throw new Error('Invalid response from Hostkit API');
        }
    }
    catch (error) {
        if (error.response) {
            // API returned an error response
            const errorMessage = error.response.data?.message || error.response.data?.error || 'API request failed';
            throw new Error(`Hostkit API Error: ${errorMessage}`);
        }
        else if (error.request) {
            // Request was made but no response received
            throw new Error('Unable to connect to Hostkit API. Please check your internet connection.');
        }
        else {
            // Something else happened
            throw new Error(`SAFT generation failed: ${error.message}`);
        }
    }
};
exports.getSaftService = getSaftService;
