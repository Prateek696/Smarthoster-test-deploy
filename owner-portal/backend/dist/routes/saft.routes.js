"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const saft_controller_1 = require("../controllers/saft.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// SAFT retrieval - accessible by owners and accountants
router.get("/saft/get", auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, saft_controller_1.getSaft);
exports.default = router;
