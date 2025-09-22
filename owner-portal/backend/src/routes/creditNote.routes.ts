import { Router } from "express";
import {
  createCreditNote,
  getCreditNotesList,
  approveCreditNoteRequest,
  issueCreditNoteRequest,
  rejectCreditNoteRequest
} from "../controllers/creditNote.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOwnerOrAccountant, requireAccountant, requireOwner } from "../middlewares/role.middleware";
import { USER_ROLES } from "../constants/roles";

const router = Router();

// Create credit note request - owners only
router.post("/", 
  authMiddleware, 
  requireOwner, 
  createCreditNote
);

// Get credit notes - owners and accountants
router.get("/", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  getCreditNotesList
);

// Approve credit note - accountants only
router.put("/:creditNoteId/approve", 
  authMiddleware, 
  requireAccountant, 
  approveCreditNoteRequest
);

// Issue credit note - accountants only
router.put("/:creditNoteId/issue", 
  authMiddleware, 
  requireAccountant, 
  issueCreditNoteRequest
);

// Reject credit note - accountants only
router.put("/:creditNoteId/reject", 
  authMiddleware, 
  requireAccountant, 
  rejectCreditNoteRequest
);

export default router;





