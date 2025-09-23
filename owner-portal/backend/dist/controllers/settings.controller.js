"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSecuritySettings = exports.getSecuritySettings = exports.updateNotificationSettings = exports.getNotificationSettings = exports.updateUserProfile = exports.getUserProfile = void 0;
const User_model_1 = require("../models/User.model");
/**
 * @desc Get user profile settings
 */
const getUserProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const user = await User_model_1.UserModel.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified,
            companies: user.companies,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserProfile = getUserProfile;
/**
 * @desc Update user profile
 */
const updateUserProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { name, phone, companies } = req.body;
        // Validate input
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ message: 'Name must be at least 2 characters long' });
        }
        // Prepare update data
        const updateData = {
            name: name.trim(),
            phone: phone?.trim() || undefined
        };
        // Add companies if provided
        if (companies) {
            updateData.companies = companies;
        }
        // Update user profile
        const updatedUser = await User_model_1.UserModel.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                isVerified: updatedUser.isVerified,
                companies: updatedUser.companies,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateUserProfile = updateUserProfile;
/**
 * @desc Get user notification settings
 */
const getNotificationSettings = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        // For now, return default settings
        // TODO: Implement user-specific notification settings in database
        const settings = {
            emailNotifications: true,
            bookingAlerts: true,
            paymentAlerts: true,
            maintenanceAlerts: false,
            weeklyReports: true,
            monthlyReports: true
        };
        res.json(settings);
    }
    catch (error) {
        console.error('Error fetching notification settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getNotificationSettings = getNotificationSettings;
/**
 * @desc Update user notification settings
 */
const updateNotificationSettings = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { emailNotifications, bookingAlerts, paymentAlerts, maintenanceAlerts, weeklyReports, monthlyReports } = req.body;
        // For now, just return success
        // TODO: Implement user-specific notification settings in database
        const settings = {
            emailNotifications: Boolean(emailNotifications),
            bookingAlerts: Boolean(bookingAlerts),
            paymentAlerts: Boolean(paymentAlerts),
            maintenanceAlerts: Boolean(maintenanceAlerts),
            weeklyReports: Boolean(weeklyReports),
            monthlyReports: Boolean(monthlyReports)
        };
        res.json({
            message: 'Notification settings updated successfully',
            settings
        });
    }
    catch (error) {
        console.error('Error updating notification settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateNotificationSettings = updateNotificationSettings;
/**
 * @desc Get user security settings
 */
const getSecuritySettings = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        // For now, return default settings
        // TODO: Implement user-specific security settings in database
        const settings = {
            twoFactorEnabled: false,
            sessionTimeout: 30,
            loginAlerts: true
        };
        res.json(settings);
    }
    catch (error) {
        console.error('Error fetching security settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSecuritySettings = getSecuritySettings;
/**
 * @desc Update user security settings
 */
const updateSecuritySettings = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { twoFactorEnabled, sessionTimeout, loginAlerts } = req.body;
        // For now, just return success
        // TODO: Implement user-specific security settings in database
        const settings = {
            twoFactorEnabled: Boolean(twoFactorEnabled),
            sessionTimeout: Number(sessionTimeout) || 30,
            loginAlerts: Boolean(loginAlerts)
        };
        res.json({
            message: 'Security settings updated successfully',
            settings
        });
    }
    catch (error) {
        console.error('Error updating security settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateSecuritySettings = updateSecuritySettings;
