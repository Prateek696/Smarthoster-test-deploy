import { Request, Response } from 'express';
import { UserModel } from '../models/User.model';
import { authMiddleware } from '../middlewares/auth.middleware';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * @desc Get user profile settings
 */
export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await UserModel.findById(req.user.id).select('-password');
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc Update user profile
 */
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { name, phone } = req.body;

    // Validate input
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    // Update user profile
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      { 
        name: name.trim(),
        phone: phone?.trim() || undefined
      },
      { new: true, runValidators: true }
    ).select('-password');

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
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc Get user notification settings
 */
export const getNotificationSettings = async (req: AuthenticatedRequest, res: Response) => {
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
  } catch (error: any) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc Update user notification settings
 */
export const updateNotificationSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const {
      emailNotifications,
      bookingAlerts,
      paymentAlerts,
      maintenanceAlerts,
      weeklyReports,
      monthlyReports
    } = req.body;

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
  } catch (error: any) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc Get user security settings
 */
export const getSecuritySettings = async (req: AuthenticatedRequest, res: Response) => {
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
  } catch (error: any) {
    console.error('Error fetching security settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc Update user security settings
 */
export const updateSecuritySettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const {
      twoFactorEnabled,
      sessionTimeout,
      loginAlerts
    } = req.body;

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
  } catch (error: any) {
    console.error('Error updating security settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

