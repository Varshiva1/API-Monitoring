import Monitor from '../models/Monitor.js';
import Incident from '../models/Incident.js';

// @desc    Create new monitor
// @route   POST /api/monitors
// @access  Private
export const createMonitor = async (req, res, next) => {
  try {
    const monitorData = {
      ...req.body,
      user: req.user.id,
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

// @desc    Get all monitors
// @route   GET /api/monitors
// @access  Private
export const getMonitors = async (req, res, next) => {
  try {
    const { status, isActive } = req.query;
    
    const query = { user: req.user.id };
    
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

// @desc    Get single monitor
// @route   GET /api/monitors/:id
// @access  Private
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
    if (monitor.user.toString() !== req.user.id && req.user.role !== 'admin') {
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

// @desc    Update monitor
// @route   PUT /api/monitors/:id
// @access  Private
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
    if (monitor.user.toString() !== req.user.id && req.user.role !== 'admin') {
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

// @desc    Delete monitor
// @route   DELETE /api/monitors/:id
// @access  Private
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
    if (monitor.user.toString() !== req.user.id && req.user.role !== 'admin') {
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

// @desc    Get monitor statistics
// @route   GET /api/monitors/:id/stats
// @access  Private
export const getMonitorStats = async (req, res, next) => {
  try {
    const monitor = await Monitor.findById(req.params.id);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found',
      });
    }

    // Make sure user owns monitor
    if (monitor.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this monitor',
      });
    }

    // Get incidents for this monitor
    const [incidents, totalIncidents, openIncidents] = await Promise.all([
      Incident.find({ monitor: monitor._id })
        .sort('-startTime')
        .limit(10),
      Incident.countDocuments({ monitor: monitor._id }),
      Incident.countDocuments({ monitor: monitor._id, status: 'open' }),
    ]);

    const stats = {
      monitor: {
        name: monitor.name,
        url: monitor.url,
        status: monitor.status,
        uptime: monitor.uptime,
        lastChecked: monitor.lastChecked,
        lastResponseTime: monitor.lastResponseTime,
        uptimeString: monitor.getUptimeString(),
      },
      incidents: {
        total: totalIncidents,
        open: openIncidents,
        recent: incidents,
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

// @desc    Toggle monitor active status
// @route   PATCH /api/monitors/:id/toggle
// @access  Private
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
    if (monitor.user.toString() !== req.user.id && req.user.role !== 'admin') {
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