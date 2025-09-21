import { Router } from "express";
import { getInvoices, debugInvoices, downloadInvoice, exportInvoices } from "../controllers/invoice.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOwnerOrAccountant } from "../middlewares/role.middleware";

const router = Router();

// Invoice endpoints - accessible by owners and accountants
router.get("/:listingId", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  getInvoices
);

// Download invoice endpoint
router.get("/:listingId/:invoiceId/download", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  downloadInvoice
);

// Debug endpoint for testing invoice API
router.get("/:listingId/debug", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  debugInvoices
);

// Export all invoices as ZIP
router.get("/:listingId/export", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  exportInvoices
);

export default router;
