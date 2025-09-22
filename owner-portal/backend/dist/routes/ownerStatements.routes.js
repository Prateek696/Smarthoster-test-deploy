"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ownerStatements_controller_1 = require("../controllers/ownerStatements.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = express_1.default.Router();
// Get owner statements for a property
router.get('/property/:propertyId', auth_middleware_1.authMiddleware, role_middleware_1.requireOwnerOrAccountant, ownerStatements_controller_1.getOwnerStatements);
exports.default = router;
