import User from '../models/User.js';
import Monitor from '../models/Monitor.js';
import Incident from '../models/Incident.js';

//   Create user (admin only)

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Validate role
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"',
      });
    }

    // Create user (admin can create users with any role, but default is 'user')
    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get all users

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

//   Get single user by email

export const getUser = async (req, res, next) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const user = await User.findOne({ email: email.toLowerCase() }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//   Update user role by email (promote to admin)

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"',
      });
    }

    const email = decodeURIComponent(req.params.email);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from removing their own admin role
    if (user._id.toString() === req.user._id.toString() && role === 'user') {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own admin role',
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    next(error);
  }
};

//  Get all monitors (admin can see all users' monitors)

export const getAllMonitors = async (req, res, next) => {
  try {
    const { status, isActive, userId } = req.query;
    
    const query = {};
    
    if (userId) query.user = userId;
    if (status) query.status = status;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const monitors = await Monitor.find(query)
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: monitors.length,
      data: monitors,
    });
  } catch (error) {
    next(error);
  }
};

//  Get all incidents (admin can see all users' incidents)

export const getAllIncidents = async (req, res, next) => {
  try {
    const { status, monitorId, userId, limit = 100 } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (monitorId) query.monitor = monitorId;
    
    // If userId provided, filter by user's monitors
    if (userId) {
      const userMonitors = await Monitor.find({ user: userId });
      const monitorIds = userMonitors.map(m => m._id);
      query.monitor = { $in: monitorIds };
    }

    const incidents = await Incident.find(query)
      .populate('monitor', 'name url user')
      .populate('resolvedBy', 'name email')
      .sort('-startTime')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents,
    });
  } catch (error) {
    next(error);
  }
};

//  Get admin dashboard statistics

export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      totalMonitors,
      activeMonitors,
      totalIncidents,
      openIncidents,
      resolvedIncidents,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      Monitor.countDocuments(),
      Monitor.countDocuments({ isActive: true }),
      Incident.countDocuments(),
      Incident.countDocuments({ status: 'open' }),
      Incident.countDocuments({ status: 'resolved' }),
    ]);

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers,
        regular: totalUsers - adminUsers,
      },
      monitors: {
        total: totalMonitors,
        active: activeMonitors,
        inactive: totalMonitors - activeMonitors,
      },
      incidents: {
        total: totalIncidents,
        open: openIncidents,
        resolved: resolvedIncidents,
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

//  Delete user by email (admin only)

export const deleteUser = async (req, res, next) => {
  try {
    const email = decodeURIComponent(req.params.email);
    
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account through this route',
      });
    }

    // Prevent deleting the last admin - ensure at least one admin always exists
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin. At least one admin must remain in the system.',
        });
      }
    }

    // Admin can delete any user including other admins (if not the last one)
    const userRole = user.role;
    
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
      message: `${userRole === 'admin' ? 'Admin' : 'User'} and associated data deleted successfully`,
      deletedUser: {
        id: user._id,
        email: user.email,
        role: userRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

//   Delete all users (admin only - with safety checks)

export const deleteAllUsers = async (req, res, next) => {
  try {
    const { confirm, excludeAdmins = true } = req.body;

    // Require explicit confirmation
    if (confirm !== 'DELETE_ALL_USERS') {
      return res.status(400).json({
        success: false,
        message: 'This action requires explicit confirmation. Send { "confirm": "DELETE_ALL_USERS" }',
        warning: 'This will delete ALL users and their data. Use with extreme caution!',
      });
    }

    // Build query - exclude admins by default for safety
    const query = {};
    if (excludeAdmins) {
      query.role = { $ne: 'admin' };
    } else {
      // If deleting admins, ensure at least one admin remains
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete all admins. At least one admin must remain in the system.',
        });
      }
    }

    const usersToDelete = await User.find(query);
    
    if (usersToDelete.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No users found to delete',
        deletedCount: 0,
      });
    }

    // Get all user IDs
    const userIds = usersToDelete.map(u => u._id);

    // Get all monitors for these users
    const userMonitors = await Monitor.find({ user: { $in: userIds } });
    const monitorIds = userMonitors.map(m => m._id);

    // Delete all users, their monitors, and incidents
    const [userDeleteResult] = await Promise.all([
      User.deleteMany({ _id: { $in: userIds } }),
      Monitor.deleteMany({ _id: { $in: monitorIds } }),
      Incident.deleteMany({ monitor: { $in: monitorIds } }),
    ]);

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${userDeleteResult.deletedCount} user(s) and all associated data`,
      deletedCount: userDeleteResult.deletedCount,
      note: excludeAdmins ? 'Admins were excluded from deletion' : 'All users including admins were deleted',
    });
  } catch (error) {
    next(error);
  }
};


