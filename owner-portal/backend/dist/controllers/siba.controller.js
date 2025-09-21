"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugSibaApis = exports.getSibaLogs = exports.getBulkSibaStatus = exports.validateSiba = exports.sendSiba = exports.getSibaStatus = void 0;
const siba_service_1 = require("../services/siba.service");
const getSibaStatus = async (req, res) => {
    const propertyId = parseInt(req.params.propertyId);
    if (!propertyId) {
        return res.status(400).json({ message: "Property ID is required" });
    }
    try {
        const result = await (0, siba_service_1.getSibaStatusService)(propertyId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching SIBA status",
            error: error.message
        });
    }
};
exports.getSibaStatus = getSibaStatus;
const sendSiba = async (req, res) => {
    const propertyId = parseInt(req.params.propertyId);
    const { reservationId } = req.body;
    if (!propertyId || !reservationId) {
        return res.status(400).json({
            message: "Property ID and Reservation ID are required"
        });
    }
    try {
        const result = await (0, siba_service_1.sendSibaService)(reservationId, propertyId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            message: "Error sending SIBA",
            error: error.message
        });
    }
};
exports.sendSiba = sendSiba;
const validateSiba = async (req, res) => {
    const { reservationId } = req.params;
    if (!reservationId) {
        return res.status(400).json({ message: "Reservation ID is required" });
    }
    try {
        const result = await (0, siba_service_1.validateSibaService)(parseInt(reservationId));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            message: "Error validating SIBA",
            error: error.message
        });
    }
};
exports.validateSiba = validateSiba;
const getBulkSibaStatus = async (req, res) => {
    const { propertyIds } = req.body;
    if (!propertyIds || !Array.isArray(propertyIds)) {
        return res.status(400).json({
            message: "Property IDs array is required"
        });
    }
    try {
        const results = await (0, siba_service_1.bulkSibaStatusService)(propertyIds);
        res.json(results);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching bulk SIBA status",
            error: error.message
        });
    }
};
exports.getBulkSibaStatus = getBulkSibaStatus;
const getSibaLogs = async (req, res) => {
    const { reservationId } = req.params;
    if (!reservationId) {
        return res.status(400).json({ message: "Reservation ID is required" });
    }
    try {
        const logs = await (0, siba_service_1.getSibaLogsService)(parseInt(reservationId));
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching SIBA logs",
            error: error.message
        });
    }
};
exports.getSibaLogs = getSibaLogs;
// Debug endpoint to test API connections
const debugSibaApis = async (req, res) => {
    const propertyId = parseInt(req.params.propertyId);
    if (!propertyId) {
        return res.status(400).json({ message: "Property ID is required" });
    }
    try {
        const { getHostkitReservations } = await Promise.resolve().then(() => __importStar(require("../integrations/hostkit.api")));
        const { getHostawayReservations } = await Promise.resolve().then(() => __importStar(require("../integrations/hostaway.api")));
        const currentDate = new Date();
        const oneMonthAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
        const startDate = oneMonthAgo.toISOString().split('T')[0];
        const endDate = currentDate.toISOString().split('T')[0];
        // Testing API connections for debugging
        const debugResult = {
            propertyId,
            dateRange: { startDate, endDate },
            apis: {}
        };
        // Test Hostkit API
        try {
            const hostkitData = await getHostkitReservations(propertyId, startDate, endDate);
            debugResult.apis.hostkit = {
                success: true,
                dataType: Array.isArray(hostkitData) ? 'array' : typeof hostkitData,
                count: Array.isArray(hostkitData) ? hostkitData.length : 'not-array',
                sampleFields: Array.isArray(hostkitData) && hostkitData.length > 0 ? Object.keys(hostkitData[0]) : [],
                rawSample: Array.isArray(hostkitData) && hostkitData.length > 0 ? hostkitData[0] : null
            };
        }
        catch (hostkitError) {
            debugResult.apis.hostkit = {
                success: false,
                error: hostkitError.message,
                stack: hostkitError.stack
            };
        }
        // Test Hostaway API
        try {
            const hostawayData = await getHostawayReservations(propertyId, startDate, endDate);
            const reservations = hostawayData.result || [];
            debugResult.apis.hostaway = {
                success: true,
                dataType: typeof hostawayData,
                resultType: Array.isArray(hostawayData.result) ? 'array' : typeof hostawayData.result,
                count: Array.isArray(reservations) ? reservations.length : 'not-array',
                sampleFields: Array.isArray(reservations) && reservations.length > 0 ? Object.keys(reservations[0]) : [],
                rawSample: Array.isArray(reservations) && reservations.length > 0 ? reservations[0] : null
            };
        }
        catch (hostawayError) {
            debugResult.apis.hostaway = {
                success: false,
                error: hostawayError.message,
                stack: hostawayError.stack
            };
        }
        // Environment check
        debugResult.environment = {
            HOSTKIT_API_URL: process.env.HOSTKIT_API_URL || 'not-set',
            HOSTKIT_API_KEY: process.env.HOSTKIT_API_KEY ? 'set' : 'not-set',
            HOSTAWAY_API_BASE: process.env.HOSTAWAY_API_BASE || 'not-set',
            HOSTAWAY_API_KEY: process.env.HOSTAWAY_API_KEY ? 'set' : 'not-set'
        };
        res.json(debugResult);
    }
    catch (error) {
        res.status(500).json({
            message: "Error debugging SIBA APIs",
            error: error.message
        });
    }
};
exports.debugSibaApis = debugSibaApis;
