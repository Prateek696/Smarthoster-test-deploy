"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAccountant = exports.requireOwnerOnly = exports.requireOwnerOrAccountant = exports.requireOwner = exports.requireRole = void 0;
const User_model_1 = require("../models/User.model");
/**
 * Middleware to restrict access based on user role
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
const requireRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Authentication required' });
            }
            // Get user from database to ensure we have the latest role
            const user = await User_model_1.UserModel.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Admin has access to everything
            if (user.role === 'admin') {
                req.user.role = user.role;
                return next();
            }
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    message: 'Access denied. Insufficient permissions.',
                    requiredRoles: allowedRoles,
                    userRole: user.role
                });
            }
            // Add user role to request for use in controllers
            req.user.role = user.role;
            next();
        }
        catch (error) {
            console.error('Role middleware error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};
exports.requireRole = requireRole;
/**
 * Middleware to restrict access to owners only
 */
exports.requireOwner = (0, exports.requireRole)(['owner']);
/**
 * Middleware to restrict access to owners and accountants (but not regular users)
 */
exports.requireOwnerOrAccountant = (0, exports.requireRole)(['owner', 'accountant']);
/**
 * Middleware to restrict access to owners only for sensitive operations
 */
exports.requireOwnerOnly = (0, exports.requireRole)(['owner']);
/**
 * Middleware to restrict access to accountants only
 */
exports.requireAccountant = (0, exports.requireRole)(['accountant']);
