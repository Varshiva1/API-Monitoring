import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Monitor from '../models/Monitor.js';
import Incident from '../models/Incident.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register user
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Create user - role is always 'user' by default (cannot be set during registration)
    // Even if someone tries to pass 'role' in body, it will be ignored
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

//  Login user

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current logged in user
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//   Update user password

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

//   Delete user account (self-deletion for users, admin can delete by email)

export const deleteUser = async (req, res, next) => {
  try {
    const { password, email } = req.body;
    const isAdmin = req.user.role === 'admin';

    // If admin is deleting another user, email is required
    if (isAdmin && email) {
      const targetUser = await User.findOne({ email: email.toLowerCase() });
      
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Prevent admin from deleting themselves through this route
      if (targetUser._id.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Admins cannot delete themselves through this route',
        });
      }

      // Get target user's monitors
      const userMonitors = await Monitor.find({ user: targetUser._id });
      const monitorIds = userMonitors.map(m => m._id);

      // Delete target user's monitors, incidents, and user account
      await Promise.all([
        Monitor.deleteMany({ _id: { $in: monitorIds } }),
        Incident.deleteMany({ monitor: { $in: monitorIds } }),
        targetUser.deleteOne(),
      ]);

      return res.status(200).json({
        success: true,
        message: 'User account and all associated data deleted successfully',
      });
    }

    // Regular user deleting themselves - requires password
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide password to confirm account deletion',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password',
      });
    }

    // Get user's monitors
    const userMonitors = await Monitor.find({ user: user._id });
    const monitorIds = userMonitors.map(m => m._id);

    // Delete user's monitors, incidents, and user account
    await Promise.all([
      Monitor.deleteMany({ _id: { $in: monitorIds } }),
      Incident.deleteMany({ monitor: { $in: monitorIds } }),
      user.deleteOne(),
    ]);

    res.status(200).json({
      success: true,
      message: 'User account and all associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};