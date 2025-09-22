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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sibaManager_service_1 = require("../services/sibaManager.service");
const router = express_1.default.Router();
// Validate SIBA submission for a reservation
router.post('/validate', async (req, res) => {
    try {
        const { propertyId, reservationData } = req.body;
        if (!propertyId || !reservationData) {
            return res.status(400).json({
                success: false,
                error: 'Property ID and reservation data are required'
            });
        }
        const validation = await (0, sibaManager_service_1.validateSibaSubmission)(propertyId, reservationData);
        res.json({
            success: true,
            validation
        });
    }
    catch (error) {
        console.error('SIBA validation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Send SIBA submission for a reservation
router.post('/send', async (req, res) => {
    try {
        const { propertyId, reservationData } = req.body;
        if (!propertyId || !reservationData) {
            return res.status(400).json({
                success: false,
                error: 'Property ID and reservation data are required'
            });
        }
        const submission = await (0, sibaManager_service_1.sendSibaSubmission)(propertyId, reservationData);
        if (submission.success) {
            res.json({
                success: true,
                submissionId: submission.submissionId,
                reservationCode: submission.reservationCode,
                response: submission.response
            });
        }
        else {
            res.status(400).json({
                success: false,
                errors: submission.errors
            });
        }
    }
    catch (error) {
        console.error('SIBA submission error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Get bulk SIBA dashboard with due/overdue flags
router.get('/dashboard', async (req, res) => {
    try {
        const dashboard = await (0, sibaManager_service_1.getBulkSibaDashboard)();
        if (dashboard.success) {
            res.json({
                success: true,
                data: dashboard.data,
                summary: dashboard.summary
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: dashboard.error
            });
        }
    }
    catch (error) {
        console.error('Bulk SIBA dashboard error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Get SIBA status for a specific property (for reservation view)
router.get('/status/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;
        if (!propertyId) {
            return res.status(400).json({
                success: false,
                error: 'Property ID is required'
            });
        }
        const { getSibaStatusService } = await Promise.resolve().then(() => __importStar(require('../services/siba.service')));
        const status = await getSibaStatusService(parseInt(propertyId));
        res.json({
            success: true,
            status
        });
    }
    catch (error) {
        console.error('SIBA status error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Bulk validate multiple reservations for SIBA
router.post('/bulk-validate', async (req, res) => {
    try {
        const { reservations } = req.body;
        if (!Array.isArray(reservations)) {
            return res.status(400).json({
                success: false,
                error: 'Reservations must be an array'
            });
        }
        const validations = await Promise.all(reservations.map(async (reservation) => {
            const validation = await (0, sibaManager_service_1.validateSibaSubmission)(reservation.propertyId, reservation);
            return {
                reservationId: reservation.id || reservation.reservationId,
                propertyId: reservation.propertyId,
                validation
            };
        }));
        res.json({
            success: true,
            validations
        });
    }
    catch (error) {
        console.error('Bulk SIBA validation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Bulk send SIBA submissions for multiple reservations
router.post('/bulk-send', async (req, res) => {
    try {
        const { reservations } = req.body;
        if (!Array.isArray(reservations)) {
            return res.status(400).json({
                success: false,
                error: 'Reservations must be an array'
            });
        }
        const submissions = await Promise.all(reservations.map(async (reservation) => {
            const submission = await (0, sibaManager_service_1.sendSibaSubmission)(reservation.propertyId, reservation);
            return {
                reservationId: reservation.id || reservation.reservationId,
                propertyId: reservation.propertyId,
                submission
            };
        }));
        const successful = submissions.filter(s => s.submission.success);
        const failed = submissions.filter(s => !s.submission.success);
        res.json({
            success: true,
            summary: {
                total: submissions.length,
                successful: successful.length,
                failed: failed.length
            },
            submissions
        });
    }
    catch (error) {
        console.error('Bulk SIBA submission error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
exports.default = router;
