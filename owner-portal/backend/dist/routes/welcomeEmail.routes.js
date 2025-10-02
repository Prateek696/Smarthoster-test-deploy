"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const welcomeEmail_controller_1 = require("../controllers/welcomeEmail.controller");
const router = (0, express_1.Router)();
// Welcome email routes
router.post("/send-owner-welcome", welcomeEmail_controller_1.sendOwnerWelcomeEmail);
router.post("/send-accountant-welcome", welcomeEmail_controller_1.sendAccountantWelcomeEmailAPI);
exports.default = router;
