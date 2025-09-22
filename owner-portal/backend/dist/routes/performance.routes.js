"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const performance_controller_1 = require("../controllers/performance.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// GET /performance/:listingId?month=YYYY-MM - accessible by owners and accountants
router.get("/:listingId", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, performance_controller_1.getPerformance);
exports.default = router;
