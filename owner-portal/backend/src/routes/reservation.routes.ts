import express from 'express';
import { 
  getReservations, 
  getReservation, 
  getReservationsSummary 
} from '../controllers/reservation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireOwnerOrAccountant } from '../middlewares/role.middleware';
import { USER_ROLES } from '../constants/roles';

const router = express.Router();

// Get all reservations for a property with optional filtering
// GET /reservations/:propertyId?startDate=2025-01-01&endDate=2025-01-31&get_archived=false&from_date=2025-01-15
router.get('/:propertyId', 
  authMiddleware, 
  requireOwnerOrAccountant, 
  getReservations
);

// Get a specific reservation by reservation code
// GET /reservations/:propertyId/:reservationCode
router.get('/:propertyId/:reservationCode', 
  authMiddleware, 
  requireOwnerOrAccountant, 
  getReservation
);

// Get reservations summary/statistics for a property
// GET /reservations/:propertyId/summary?startDate=2025-01-01&endDate=2025-01-31
router.get('/:propertyId/summary', 
  authMiddleware, 
  requireOwnerOrAccountant, 
  getReservationsSummary
);

export default router;




