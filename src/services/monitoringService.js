import cron from 'node-cron';
import axios from 'axios';
import Monitor from '../models/Monitor.js';
import Incident from '../models/Incident.js';
import * as alertService from './alertService.js';
import config from '../config/config.js';

// Check a single monitor
const checkMonitor = async (monitor) => {
  const startTime = Date.now();
  
  try {
    const response = await axios({
      method: monitor.method,
      url: monitor.url,
      headers: monitor.headers ? (monitor.headers instanceof Map ? Object.fromEntries(monitor.headers) : monitor.headers) : {},
      timeout: monitor.timeout * 1000,
      validateStatus: () => true, // Don't throw on any status code
    });

    const responseTime = Date.now() - startTime;
    const statusCode = response.status;

    // Update monitor check stats
    monitor.lastChecked = new Date();
    monitor.lastResponseTime = responseTime;
    monitor.uptime.totalChecks += 1;

    // Check if monitor is up or down
    const isUp = statusCode === monitor.expectedStatusCode;

    if (isUp) {
      // Monitor is UP
      monitor.uptime.successfulChecks += 1;
      monitor.consecutiveFailures = 0;

      // If monitor was down, resolve the incident
      if (monitor.status === 'down') {
        await resolveOpenIncidents(monitor);
      }

      monitor.status = 'up';

      // Check for slow response
      if (responseTime > config.responseTimeThreshold) {
        await createIncident(monitor, 'slow_response', {
          statusCode,
          responseTime,
        });
      }
    } else {
      // Monitor is DOWN
      monitor.uptime.failedChecks += 1;
      monitor.consecutiveFailures += 1;

      // Create incident if threshold is reached
      if (monitor.consecutiveFailures >= config.downtimeThreshold) {
        monitor.status = 'down';
        
        // Check if there's already an open incident
        const existingIncident = await Incident.findOne({
          monitor: monitor._id,
          status: { $in: ['open', 'acknowledged'] },
        });

        if (!existingIncident) {
          console.log(`🚨 Creating incident for ${monitor.name} - Threshold reached!`);
          await createIncident(monitor, 'status_code_mismatch', {
            statusCode,
            responseTime,
            expectedStatusCode: monitor.expectedStatusCode,
          });
        } else {
          console.log(`ℹ️  Incident already exists for ${monitor.name}`);
        }
      } else {
        console.log(`⏳ ${monitor.name} - Waiting for ${config.downtimeThreshold - monitor.consecutiveFailures} more failure(s) before creating incident`);
      }
    }

    monitor.calculateUptime();
    await monitor.save();

    console.log(`✓ Checked ${monitor.name} - Status: ${monitor.status}, Response: ${responseTime}ms`);
  } catch (error) {
    // Handle timeout and network errors
    monitor.lastChecked = new Date();
    monitor.uptime.totalChecks += 1;
    monitor.uptime.failedChecks += 1;
    monitor.consecutiveFailures += 1;

    console.log(`⚠️  ${monitor.name} - Consecutive failures: ${monitor.consecutiveFailures}/${config.downtimeThreshold}`);

    if (monitor.consecutiveFailures >= config.downtimeThreshold) {
      monitor.status = 'down';

      const existingIncident = await Incident.findOne({
        monitor: monitor._id,
        status: { $in: ['open', 'acknowledged'] },
      });

      if (!existingIncident) {
        console.log(`🚨 Creating incident for ${monitor.name} - Threshold reached!`);
        await createIncident(monitor, 'timeout', {
          errorMessage: error.message,
        });
      } else {
        console.log(`ℹ️  Incident already exists for ${monitor.name}`);
      }
    } else {
      console.log(`⏳ ${monitor.name} - Waiting for ${config.downtimeThreshold - monitor.consecutiveFailures} more failure(s) before creating incident`);
    }

    monitor.calculateUptime();
    await monitor.save();

    console.log(`✗ Failed to check ${monitor.name} - Error: ${error.message}`);
  }
};

// Create an incident
const createIncident = async (monitor, type, details) => {
  try {
    const incident = await Incident.create({
      monitor: monitor._id,
      type,
      details,
    });

    console.log(`✅ Incident #${incident._id} created for ${monitor.name} - Type: ${type}`);

    // Check if email alerts are enabled
    if (!monitor.alertChannels || !monitor.alertChannels.email) {
      console.warn(`⚠️  Email alerts are disabled for ${monitor.name}. Enable alertChannels.email to receive notifications.`);
    }

    // Send alerts
    await alertService.sendAlert(monitor, incident);

    console.log(`📧 Alert sent for ${monitor.name}`);
    
    return incident;
  } catch (error) {
    console.error(`❌ Error creating incident: ${error.message}`);
    console.error(error.stack);
  }
};

// Resolve open incidents for a monitor
const resolveOpenIncidents = async (monitor) => {
  try {
    const openIncidents = await Incident.find({
      monitor: monitor._id,
      status: { $in: ['open', 'acknowledged'] },
    });

    for (const incident of openIncidents) {
      incident.resolve();
      await incident.save();
      
      // Send recovery notification
      await alertService.sendRecoveryAlert(monitor, incident);
      
      console.log(`✓ Incident resolved for ${monitor.name}`);
    }
  } catch (error) {
    console.error(`Error resolving incidents: ${error.message}`);
  }
};

// Check all active monitors
const checkAllMonitors = async () => {
  try {
    const monitors = await Monitor.find({ isActive: true });
    
    if (monitors.length === 0) {
      console.log('No active monitors to check');
      return;
    }
    
    console.log(`\n--- Checking ${monitors.length} monitors at ${new Date().toISOString()} ---`);
    
    // Check monitors in parallel with concurrency limit
    const BATCH_SIZE = 5;
    for (let i = 0; i < monitors.length; i += BATCH_SIZE) {
      const batch = monitors.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(monitor => checkMonitor(monitor)));
    }
    
    console.log(`--- Check completed ---\n`);
  } catch (error) {
    console.error('Error checking monitors:', error);
  }
};

// Start the monitoring service
export const startMonitoring = () => {
  console.log('🚀 Monitoring service started');
  console.log(`📅 Check interval: every ${config.checkInterval} minutes`);
  
  // Run immediately on startup
  checkAllMonitors();
  
  // Schedule to run every 5 minutes
  cron.schedule(`*/${config.checkInterval} * * * *`, () => {
    checkAllMonitors();
  });
};

// Manual check for specific monitor
export const checkMonitorNow = async (monitorId) => {
  try {
    const monitor = await Monitor.findById(monitorId);
    if (!monitor) {
      throw new Error('Monitor not found');
    }
    
    await checkMonitor(monitor);
    return monitor;
  } catch (error) {
    console.error(`Error checking monitor ${monitorId}:`, error);
    throw error;
  }
};