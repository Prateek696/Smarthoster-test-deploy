"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.USER_ROLES = void 0;
exports.USER_ROLES = {
    ADMIN: 'admin',
    OWNER: 'owner',
    ACCOUNTANT: 'accountant',
    USER: 'user'
};
exports.ROLE_PERMISSIONS = {
    ADMIN: ['read', 'write', 'block_calendar', 'view_performance', 'view_invoices', 'generate_saft', 'view_tourist_tax', 'manage_users', 'manage_properties', 'manage_owners'],
    OWNER: ['read', 'write', 'block_calendar', 'view_performance', 'view_invoices'],
    ACCOUNTANT: ['read', 'view_invoices', 'generate_saft', 'view_tourist_tax'],
    USER: ['read']
};
