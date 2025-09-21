"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statements_controller_1 = require("../controllers/statements.controller");
const router = (0, express_1.Router)();
router.post('/properties/:propertyId/statements/generate', statements_controller_1.generateStatementHandler);
exports.default = router;
