import Monitor from '../models/Monitor.js';
import Incident from '../models/Incident.js';

//   Create new monitor

export const createMonitor = async (req, res, next) => {
  try {
    const monitorData = {
      ...req.body,
      user: req.user._id || req.user.id,
    };

    const monitor = await Monitor.create(monitorData);

    res.status(201).json({
      success: true,
      data: monitor,
      message: 'Monitor created successfully',
    });
  } catch (error) {
    next(error);
  }
};

//  Get all monitors

export const getMonitors = async (req, res, next) => {
  try {
    const { status, isActive } = req.query;
    
    // Use the user's MongoDB _id for querying
    const userId = req.user._id || req.user.id;
    const query = { user: userId };
    
    if (status) query.status = status;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const monitors = await Monitor.find(query).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: monitors.length,
      data: monitors,
    });
  } catch (error) {
    next(error);
  }
};

//   Get single monitor

export const getMonitor = async (req, res, next) => {
  try {
    const monitor = await Monitor.findById(req.params.id);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found',
      });
    }

    // Make sure user owns monitor
    if (monitor.user.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this monitor',
      });
    }

    res.status(200).json({
      success: true,
      data: monitor,
    });
  } catch (error) {
    next(error);
  }
};

//  Update monitor

export const updateMonitor = async (req, res, next) => {
  try {
    let monitor = await Monitor.findById(req.params.id);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found',
      });
    }

    // Make sure user owns monitor
    if (monitor.user.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this monitor',
      });
    }

    // Don't allow updating user field
    delete req.body.user;

    monitor = await Monitor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: monitor,
      message: 'Monitor updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

//    Delete monitor

export const deleteMonitor = async (req, res, next) => {
  try {
    const monitor = await Monitor.findById(req.params.id);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found',
      });
    }

    // Make sure user owns monitor
    if (monitor.user.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this monitor',
      });
    }

    await monitor.deleteOne();

    // Delete associated incidents
    await Incident.deleteMany({ monitor: monitor._id });

    res.status(200).json({
      success: true,
      data: {},
      message: 'Monitor deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

//  Delete all monitors

export const deleteAllMonitors = async (req, res, next) => {
  try {
    const userMonitors = await Monitor.find({ user: req.user._id || req.user.id });
    
    if (userMonitors.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No monitors found to delete',
        deletedCount: 0,
      });
    }

    const monitorIds = userMonitors.map(m => m._id);

    const [deleteResult] = await Promise.all([
      Monitor.deleteMany({ _id: { $in: monitorIds } }),
      Incident.deleteMany({ monitor: { $in: monitorIds } }),
    ]);

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.deletedCount} monitor(s)`,
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

//  Toggle monitor active status

export const toggleMonitor = async (req, res, next) => {
  try {
    const monitor = await Monitor.findById(req.params.id);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found',
      });
    }

    // Make sure user owns monitor
    if (monitor.user.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this monitor',
      });
    }

    monitor.isActive = !monitor.isActive;
    monitor.status = monitor.isActive ? 'unknown' : 'paused';
    await monitor.save();

    res.status(200).json({
      success: true,
      data: monitor,
      message: `Monitor ${monitor.isActive ? 'activated' : 'paused'}`,
    });
  } catch (error) {
    next(error);
  }
};