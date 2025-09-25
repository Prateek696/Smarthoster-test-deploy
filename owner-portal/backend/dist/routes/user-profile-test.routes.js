"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_profile_global_controller_1 = require("../controllers/user-profile-global.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Test routes using NEW global connection pattern
router.get("/current-user-global", auth_middleware_1.authMiddleware, user_profile_global_controller_1.getCurrentUserGlobal);
router.put("/update-profile-global", auth_middleware_1.authMiddleware, user_profile_global_controller_1.updateUserProfileGlobal);
// Test routes using OLD mongoose pattern for comparison
router.get("/current-user-original", auth_middleware_1.authMiddleware, user_profile_global_controller_1.getCurrentUserOriginal);
router.put("/update-profile-original", auth_middleware_1.authMiddleware, user_profile_global_controller_1.updateUserProfileOriginal);
exports.default = router;
