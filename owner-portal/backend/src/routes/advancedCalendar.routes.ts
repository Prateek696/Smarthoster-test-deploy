import { Router } from "express";
import {
  getAdvancedCalendarEvents,
  createAdvancedCalendarEvent,
  updateAdvancedCalendarEvent,
  deleteAdvancedCalendarEvent,
  getBulkOperations,
  createBulkOperation
} from "../controllers/advancedCalendar.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOwnerOrAccountant, requireOwner } from "../middlewares/role.middleware";

const router = Router();

// Advanced calendar endpoints
router.get("/events", authMiddleware, getAdvancedCalendarEvents);
router.post("/events", authMiddleware, requireOwner, createAdvancedCalendarEvent);
router.put("/events/:eventId", authMiddleware, requireOwner, updateAdvancedCalendarEvent);
router.delete("/events/:eventId", authMiddleware, requireOwner, deleteAdvancedCalendarEvent);

// Bulk operations
router.get("/bulk-operations", authMiddleware, getBulkOperations);
router.post("/bulk-operations", authMiddleware, requireOwner, createBulkOperation);

export default router;