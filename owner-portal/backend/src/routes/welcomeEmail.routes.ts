import { Router } from "express";
import { sendOwnerWelcomeEmail, sendAccountantWelcomeEmailAPI } from "../controllers/welcomeEmail.controller";

const router = Router();

// Welcome email routes
router.post("/send-owner-welcome", sendOwnerWelcomeEmail);
router.post("/send-accountant-welcome", sendAccountantWelcomeEmailAPI);

export default router;

