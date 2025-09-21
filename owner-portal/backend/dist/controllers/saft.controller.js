"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSaft = void 0;
const saft_service_1 = require("../services/saft.service");
const property_model_1 = __importDefault(require("../models/property.model"));
const getSaft = async (req, res) => {
    try {
        const { year, month, invoicing_nif } = req.query;
        // Validate input
        if (!year || !month || !invoicing_nif) {
            return res.status(400).json({
                message: "Missing required parameters: year, month, invoicing_nif"
            });
        }
        // Get the first available property with Hostkit configuration
        const property = await property_model_1.default.findOne({
            hostkitId: { $exists: true, $ne: null },
            hostkitApiKey: { $exists: true, $ne: null }
        });
        if (!property) {
            return res.status(400).json({
                message: "No property with Hostkit configuration found"
            });
        }
        const result = await (0, saft_service_1.getSaftService)({
            propertyId: property.id.toString(),
            year: parseInt(year),
            month: parseInt(month),
            invoicingNif: invoicing_nif
        });
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('SAFT retrieval error:', error);
        res.status(500).json({
            message: error.message || "SAFT retrieval failed"
        });
    }
};
exports.getSaft = getSaft;
