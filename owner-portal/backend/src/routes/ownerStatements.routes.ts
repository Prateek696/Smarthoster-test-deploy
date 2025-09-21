import express from 'express';
import { getOwnerStatements } from '../controllers/ownerStatements.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireOwnerOrAccountant } from '../middlewares/role.middleware';

const router = express.Router();

// Get owner statements for a property
router.get(
  '/property/:propertyId',
  authMiddleware,
  requireOwnerOrAccountant,
  getOwnerStatements
);

export default router;