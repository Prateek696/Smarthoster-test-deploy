"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Profile routes
router.get("/profile", auth_middleware_1.authMiddleware, settings_controller_1.getUserProfile);
router.put("/profile", auth_middleware_1.authMiddleware, settings_controller_1.updateUserProfile);
// Notification settings routes
router.get("/notifications", auth_middleware_1.authMiddleware, settings_controller_1.getNotificationSettings);
router.put("/notifications", auth_middleware_1.authMiddleware, settings_controller_1.updateNotificationSettings);
// Security settings routes
router.get("/security", auth_middleware_1.authMiddleware, settings_controller_1.getSecuritySettings);
router.put("/security", auth_middleware_1.authMiddleware, settings_controller_1.updateSecuritySettings);
exports.default = router;
