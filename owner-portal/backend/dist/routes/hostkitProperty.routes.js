"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hostkitProperty_controller_1 = require("../controllers/hostkitProperty.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Property retrieval - accessible by owners and accountants
router.get("/properties/:propertyId", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, hostkitProperty_controller_1.getProperty);
exports.default = router;
