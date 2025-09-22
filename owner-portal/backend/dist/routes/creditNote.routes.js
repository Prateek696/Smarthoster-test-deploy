"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const creditNote_controller_1 = require("../controllers/creditNote.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Create credit note request - owners only
router.post("/", auth_middleware_1.authMiddleware, role_middleware_1.requireOwner, creditNote_controller_1.createCreditNote);
// Get credit notes - owners and accountants
router.get("/", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, creditNote_controller_1.getCreditNotesList);
// Approve credit note - accountants only
router.put("/:creditNoteId/approve", auth_middleware_1.authMiddleware, role_middleware_1.requireAccountant, creditNote_controller_1.approveCreditNoteRequest);
// Issue credit note - accountants only
router.put("/:creditNoteId/issue", auth_middleware_1.authMiddleware, role_middleware_1.requireAccountant, creditNote_controller_1.issueCreditNoteRequest);
// Reject credit note - accountants only
router.put("/:creditNoteId/reject", auth_middleware_1.authMiddleware, role_middleware_1.requireAccountant, creditNote_controller_1.rejectCreditNoteRequest);
exports.default = router;
