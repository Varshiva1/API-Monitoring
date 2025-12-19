import Incident from '../models/Incident.js';
import Monitor from '../models/Monitor.js';

// @route   GET /api/incidents
// @access  Private
export const getIncidents = async (req, res, next) => {
  try {
    const { status, monitorId, limit = 50 } = req.query;
    
    let query = {};
    
    // Filter by monitor if provided
    if (monitorId) {
      const monitor = await Monitor.findById(monitorId);
      if (!monitor) {
        return res.status(404).json({
          success: false,
          message: 'Monitor not found',
        });
      }
      
      // Check if user owns the monitor
      if (monitor.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized',
        });
      }
      
      query.monitor = monitorId;
    } else {
      // Get all monitors belonging to user
      const userMonitors = await Monitor.find({ user: req.user.id });
      const monitorIds = userMonitors.map(m => m._id);
      query.monitor = { $in: monitorIds };
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const incidents = await Incident.find(query)
      .populate('monitor', 'name url')
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

// @desc    Get single incident
// @route   GET /api/incidents/:id
// @access  Private
export const getIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('monitor', 'name url user')
      .populate('resolvedBy', 'name email');

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found',
      });
    }

    // Check authorization
    if (incident.monitor.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this incident',
      });
    }

    res.status(200).json({
      success: true,
      data: incident,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Acknowledge incident
// @route   PUT /api/incidents/:id/acknowledge
// @access  Private
export const acknowledgeIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('monitor', 'user');

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found',
      });
    }

    // Check authorization
    if (incident.monitor.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to acknowledge this incident',
      });
    }

    if (incident.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot acknowledge a resolved incident',
      });
    }

    incident.status = 'acknowledged';
    await incident.save();

    res.status(200).json({
      success: true,
      data: incident,
      message: 'Incident acknowledged',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve incident
// @route   PUT /api/incidents/:id/resolve
// @access  Private
export const resolveIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('monitor', 'user');

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found',
      });
    }

    // Check authorization
    if (incident.monitor.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to resolve this incident',
      });
    }

    if (incident.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Incident is already resolved',
      });
    }

    incident.resolve();
    incident.resolvedBy = req.user.id;
    await incident.save();

    res.status(200).json({
      success: true,
      data: incident,
      message: 'Incident resolved successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get incident statistics
// @route   GET /api/incidents/stats
// @access  Private
export const getIncidentStats = async (req, res, next) => {
  try {
    // Get all monitors belonging to user
    const userMonitors = await Monitor.find({ user: req.user.id });
    const monitorIds = userMonitors.map(m => m._id);

    const [
      totalIncidents,
      openIncidents,
      resolvedIncidents,
      acknowledgedIncidents,
      resolvedWithDuration,
      incidentsByType,
    ] = await Promise.all([
      Incident.countDocuments({ monitor: { $in: monitorIds } }),
      Incident.countDocuments({ monitor: { $in: monitorIds }, status: 'open' }),
      Incident.countDocuments({ monitor: { $in: monitorIds }, status: 'resolved' }),
      Incident.countDocuments({ monitor: { $in: monitorIds }, status: 'acknowledged' }),
      Incident.find({
        monitor: { $in: monitorIds },
        status: 'resolved',
        duration: { $exists: true },
      }).select('duration'),
      Incident.aggregate([
        { $match: { monitor: { $in: monitorIds } } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    // Calculate average resolution time
    let avgResolutionTime = 0;
    if (resolvedWithDuration.length > 0) {
      const totalDuration = resolvedWithDuration.reduce((sum, inc) => sum + inc.duration, 0);
      avgResolutionTime = Math.round(totalDuration / resolvedWithDuration.length);
    }

    const stats = {
      total: totalIncidents,
      open: openIncidents,
      resolved: resolvedIncidents,
      acknowledged: acknowledgedIncidents,
      avgResolutionTime: `${avgResolutionTime} minutes`,
      byType: incidentsByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent incidents
// @route   GET /api/incidents/recent
// @access  Private
export const getRecentIncidents = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    
    const userMonitors = await Monitor.find({ user: req.user.id });
    const monitorIds = userMonitors.map(m => m._id);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const incidents = await Incident.find({
      monitor: { $in: monitorIds },
      startTime: { $gte: startDate },
    })
      .populate('monitor', 'name url')
      .sort('-startTime')
      .limit(20);

    res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents,
      period: `Last ${days} days`,
    });
  } catch (error) {
    next(error);
  }
};