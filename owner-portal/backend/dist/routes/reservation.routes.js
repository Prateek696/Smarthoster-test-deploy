"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reservation_controller_1 = require("../controllers/reservation.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = express_1.default.Router();
// Get all reservations for a property with optional filtering
// GET /reservations/:propertyId?startDate=2025-01-01&endDate=2025-01-31&get_archived=false&from_date=2025-01-15
router.get('/:propertyId', auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, reservation_controller_1.getReservations);
// Get a specific reservation by reservation code
// GET /reservations/:propertyId/:reservationCode
router.get('/:propertyId/:reservationCode', auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, reservation_controller_1.getReservation);
// Get reservations summary/statistics for a property
// GET /reservations/:propertyId/summary?startDate=2025-01-01&endDate=2025-01-31
router.get('/:propertyId/summary', auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, reservation_controller_1.getReservationsSummary);
exports.default = router;
