"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminOrOwner = exports.requireAdmin = void 0;
const requireAdmin = (req, res, next) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({
            message: 'Forbidden: Admin access required'
        });
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireAdminOrOwner = (req, res, next) => {
    const user = req.user;
    if (!user || !['admin', 'owner'].includes(user.role)) {
        return res.status(403).json({
            message: 'Forbidden: Admin or Owner access required'
        });
    }
    next();
};
exports.requireAdminOrOwner = requireAdminOrOwner;
