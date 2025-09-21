import { Router } from "express";

const router = Router();

// Simple test endpoint that doesn't require database
router.get("/test", (req, res) => {
  res.json({
    message: "Server is working!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongoUri: process.env.MONGODB_URI ? "Set" : "Not set"
  });
});

export default router;
