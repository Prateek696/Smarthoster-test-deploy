"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_1 = require("../controllers/invoice.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Invoice endpoints - accessible by owners and accountants
router.get("/:listingId", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, invoice_controller_1.getInvoices);
// Download invoice endpoint
router.get("/:listingId/:invoiceId/download", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, invoice_controller_1.downloadInvoice);
// Debug endpoint for testing invoice API
router.get("/:listingId/debug", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, invoice_controller_1.debugInvoices);
// Export all invoices as ZIP
router.get("/:listingId/export", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, invoice_controller_1.exportInvoices);
exports.default = router;
