import { Router } from "express";

const router = Router();

// Root route
router.get("/", (req, res) => {
  res.json({
    message: "Smart Hoster Owner Portal API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
    endpoints: {
      test: "/test/test",
      admin: "/admin/check-admin-exists",
      health: "/test/health"
    }
  });
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

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
