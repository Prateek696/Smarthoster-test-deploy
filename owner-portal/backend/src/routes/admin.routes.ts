import { Router } from 'express'
import { 
  checkAdminExists,
  createFirstAdmin,
  checkAdminSetup,
  getAdminDashboardStats,
  getAllOwners,
  getAllAccountants,
  createOwner,
  updateOwner,
  deleteOwner,
  updateAccountant,
  updateAccountantProperties,
  deleteAccountant,
  getAllProperties,
  createProperty,
  getOwnerApiKeys,
  updateOwnerApiKeys,
  assignPropertyToOwner,
  deleteProperty,
  generateOwnerStatement
} from '../controllers/admin.controller'
import { requireAdmin, requireAdminOrOwner } from '../middlewares/admin.middleware'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

// Public route to check if admin exists (no auth required)
router.get('/check-admin-exists', checkAdminExists)

// Public route to create first admin (one-time only)
router.post('/create-first-admin', createFirstAdmin)

// Public route to check admin setup status
router.get('/check-setup', checkAdminSetup)

// Apply auth middleware to all routes
router.use(authMiddleware)

// Admin dashboard stats
router.get('/dashboard/stats', requireAdmin, getAdminDashboardStats)

// Owner management routes
router.get('/owners', requireAdmin, getAllOwners)
router.post('/owners', requireAdmin, createOwner)
router.put('/owners/:ownerId', requireAdmin, updateOwner)
router.delete('/owners/:ownerId', requireAdmin, deleteOwner)

// Accountant management routes
router.get('/accountants', requireAdmin, getAllAccountants)
router.put('/accountants/:accountantId', requireAdmin, updateAccountant)
router.put('/accountants/:accountantId/properties', requireAdmin, updateAccountantProperties)
router.delete('/accountants/:accountantId', requireAdmin, deleteAccountant)

// Property management routes
router.get('/properties', requireAdmin, getAllProperties)
router.post('/properties', requireAdmin, createProperty)
router.delete('/properties/:propertyId', requireAdmin, deleteProperty)
router.post('/owners/:ownerId/assign-property', requireAdmin, assignPropertyToOwner)

// Owner statement routes
router.get('/properties/:propertyId/owner-statement', requireAdmin, generateOwnerStatement)

// API key management routes
router.get('/owners/:ownerId/api-keys', requireAdmin, getOwnerApiKeys)
router.put('/owners/:ownerId/api-keys', requireAdmin, updateOwnerApiKeys)

export default router
