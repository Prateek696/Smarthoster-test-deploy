"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnerStatements = void 0;
const ownerStatements_service_1 = require("../services/ownerStatements.service");
const property_model_1 = __importDefault(require("../models/property.model"));
const getOwnerStatements = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { startDate, endDate, year, month, commissionPercentage } = req.query;
        // Validate required parameters
        if (!propertyId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: propertyId, startDate, endDate'
            });
        }
        // Validate date format (basic validation)
        const startDateStr = startDate;
        const endDateStr = endDate;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDateStr) || !dateRegex.test(endDateStr)) {
            return res.status(400).json({
                success: false,
                message: 'Date format must be YYYY-MM-DD'
            });
        }
        // Check if property is admin-owned
        const property = await property_model_1.default.findOne({ id: parseInt(propertyId) });
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }
        // Calculate owner statements using reservation data
        // Use 0% commission for admin-owned properties, otherwise use the provided percentage or default 25%
        const commission = property.isAdminOwned ? 0 : (commissionPercentage ? parseInt(commissionPercentage) : 25);
        const result = await (0, ownerStatements_service_1.calculateOwnerStatements)(parseInt(propertyId), startDateStr, endDateStr, commission);
        // Format response to match expected frontend structure
        const formattedResult = [{
                id: `${propertyId}-${startDateStr}-${endDateStr}`,
                propertyId: parseInt(propertyId),
                propertyName: property.name,
                period: {
                    startDate: startDateStr,
                    endDate: endDateStr
                },
                revenue: {
                    total: result.summary.total_revenue,
                    grossRevenue: result.summary.total_revenue,
                    netRevenue: result.summary.total_revenue - result.summary.total_host_commission,
                    vat: 0
                },
                expenses: {
                    total: result.summary.management_commission,
                    commission: result.summary.management_commission,
                    fees: result.summary.total_cleaning_fees,
                    hostCommission: result.summary.total_host_commission,
                    other: 0
                },
                netPayout: result.summary.net_amount_owner,
                currency: 'EUR',
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Include detailed data for debugging
                reservations: result.reservations,
                summary: result.summary,
                // Include admin ownership flags
                isAdminOwned: result.isAdminOwned,
                requiresCommission: result.requiresCommission
            }];
        res.json(formattedResult);
    }
    catch (error) {
        console.error('Error in getOwnerStatements controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getOwnerStatements = getOwnerStatements;
